# Reppy — Architecture & Roadmap

**Problem.** Gym newbies are overwhelmed by unfamiliar equipment. Reppy lets them point a
camera at a machine and immediately learn what it is and how to use it.

**MVP.** Photo → identify equipment → show what it is, how to set it up, and demo videos
of exercises you can do on it.

**Day 2.** Workout logging and AI-generated workout plans, so users stay after they've
learned the equipment. Every MVP decision below is made with this in mind.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| App | Expo (React Native) + TypeScript, expo-router | Managed workflow + EAS Build. No Xcode needed to ship. |
| State/data | TanStack Query + Zustand | Query handles cache/retry/offline; Zustand for the little local UI state. |
| Backend | Supabase | Postgres + Auth + Storage + Edge Functions in one. |
| Vision | OpenAI vision model, called **only** from an Edge Function | Key must never reach the client. |
| Content | ExerciseDB API, **cached into our Postgres** | Videos, GIFs, instructions. Not in the hot path after first fetch. |

**Why Supabase over Firebase:** day-2 workout logging is inherently relational
(`workout → sets → exercise → equipment`) and the recommendation engine needs real
queries — "show me bench progression over 6 months", "muscles undertrained this week".
Firestore makes those awkward and expensive; Postgres makes them one query.
`pgvector` also lives in the same database for day-2 exercise similarity.

**The one thing Firebase would have done better** is offline. Gyms have terrible signal.
See §6 — we solve it with a local write queue rather than by changing backends.

---

## 2. The scan flow

```
Camera ──► downscale to ~768px, JPEG q0.7 ──► base64
                                               │
                                               ▼
                                    Edge Function: /identify-equipment
                                    (holds the OpenAI key)
                                               │
                    ┌──────────────────────────┼───────────────────────┐
                    ▼                          ▼                       ▼
            OpenAI vision            fire-and-forget:         look up equipment
            structured output        upload photo to          + cached exercises
            → equipment slug         Supabase Storage,        in Postgres
                                     insert `scan` row
                                               │
                                               ▼
                                     Result screen (< 2s)
```

### Two decisions worth calling out

**a) You do not need photo→URL to identify equipment.**
The vision API accepts base64 image data inline. Uploading to Storage first would add a
full round trip to the critical path for no benefit. So: **identification uses base64;
storage happens asynchronously and never blocks the user.**

We still store the photos — asynchronously — because the `scan` table is the most
valuable asset this app produces (see §4).

**b) Classify into a closed set. Never accept free text.**
The model must return a slug from *our* catalog, not a name it invents. Free text gives
you `"lat pulldown machine"`, `"Lat Pull-Down"`, `"pulldown"` for the same machine and
nothing joins to your content. Use structured outputs with a strict schema:

```jsonc
{
  "equipment_slug": "lat-pulldown",   // enum, generated from the equipment table
  "confidence": 0.0,                  // drives the "not quite right?" UI
  "alternatives": ["seated-cable-row"],
  "reasoning": "..."                  // debugging only, never shown
}
```

Regenerate the enum from the `equipment` table at deploy time so the prompt and the
database can never drift apart. Below a confidence threshold, show a disambiguation
picker instead of a wrong answer — and log the user's correction to `scan.was_correct`.

---

## 3. ExerciseDB integration — read this before wiring it up

ExerciseDB exercises carry `videoUrl`, `imageUrl`, `instructions`, `targetMuscles`,
`bodyParts`, and an `equipments` array. That covers the content need.

**The gotcha:** ExerciseDB's `equipments` vocabulary is *coarse*. A value like
`"LEVERAGE MACHINE"` covers dozens of physically distinct machines. Filtering their API
by equipment will **not** give you "exercises for this specific lat pulldown."

**So we don't filter at request time.** Instead:

1. `equipment` is our own catalog with our own slugs — the vocabulary the vision model
   classifies into.
2. We ingest ExerciseDB into our `exercise` table (full payload kept in a `raw` jsonb
   column so we can re-derive fields later without re-fetching).
3. `equipment_exercise` is a **curated join table** mapping our slugs to specific
   exercise IDs, with a display `rank` and a `is_beginner` flag.

This costs one seeding pass but buys three things: content quality control (bad form
advice can injure a beginner), no external API call in the user's hot path, and immunity
to ExerciseDB changing their pricing, schema, or availability.

---

## 4. Schema

```sql
-- Our vocabulary. The vision model classifies into exactly this set.
create table equipment (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,          -- 'lat-pulldown'
  display_name    text not null,
  aliases         text[] default '{}',           -- 'pulldown machine', 'lat machine'
  category        text not null,                 -- cable|plate-loaded|selectorized|cardio|free-weight|rack
  primary_muscles text[] default '{}',
  description     text,                          -- beginner-friendly "what is this"
  how_to_setup    text,
  common_mistakes text[] default '{}',
  difficulty      smallint check (difficulty between 1 and 3),
  is_active       boolean default true
);

-- Cached content from ExerciseDB (or hand-authored).
create table exercise (
  id             uuid primary key default gen_random_uuid(),
  source         text not null,                  -- 'exercisedb' | 'manual'
  source_id      text,
  name           text not null,
  video_url      text,
  image_url      text,
  instructions   text[] default '{}',
  target_muscles text[] default '{}',
  body_parts     text[] default '{}',
  raw            jsonb,                          -- full payload, re-derive without refetching
  fetched_at     timestamptz default now(),
  unique (source, source_id)
);

-- The curated mapping. This is where the quality lives.
create table equipment_exercise (
  equipment_id uuid references equipment on delete cascade,
  exercise_id  uuid references exercise  on delete cascade,
  rank         smallint default 100,
  is_beginner  boolean default false,
  curated_by   text default 'auto',              -- 'auto' | 'human'
  primary key (equipment_id, exercise_id)
);

-- Every scan. Product analytics, model eval set, and user history in one table.
create table scan (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete set null,
  image_path   text,                             -- Storage path, written async
  equipment_id uuid references equipment on delete set null,
  confidence   real,
  alternatives jsonb,
  model        text,
  latency_ms   integer,
  was_correct  boolean,                          -- from the "not quite right?" flow
  created_at   timestamptz default now()
);

-- ── Day 2. Created now so logging is additive, not a migration. ──
create table workout (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  notes text
);

create table workout_set (
  id           uuid primary key default gen_random_uuid(),
  workout_id   uuid references workout on delete cascade not null,
  exercise_id  uuid references exercise on delete set null,
  equipment_id uuid references equipment on delete set null,
  set_index    smallint not null,
  weight_kg    numeric(6,2),
  reps         smallint,
  rpe          numeric(3,1),
  completed_at timestamptz default now()
);
```

Row Level Security on every user-owned table from day one — `scan`, `workout`,
`workout_set` filtered by `auth.uid()`. `equipment`, `exercise`, and
`equipment_exercise` are public-read, service-role-write.

**Why `scan` matters more than it looks.** It is simultaneously: user scan history (a
day-1 feature — "machines I've met"), the eval set for measuring vision accuracy, the
labelled training data if you ever fine-tune or self-host a classifier, and the signal
for what equipment to expand the catalog with next.

---

## 5. Security

- The OpenAI key and the ExerciseDB key live in Edge Function secrets. **Never** in the
  app bundle, `.env`, or `app.config.js` — anything shipped to a device is extractable.
- Rate-limit `/identify-equipment` per user. A leaked endpoint without a limit is a bill.
- Anonymous auth for first-run so users can scan before signing up; upgrade the same
  `auth.users` row to a real account later so their scan history survives.

## 6. Offline

Gyms are basements. Day 1 this barely matters (a scan needs the network anyway — degrade
with a clear "no connection" state). Day 2 it matters a lot: nobody wants to lose a
logged set.

Plan: write sets to local SQLite (`expo-sqlite`) first, sync to Supabase in the
background with a queue. Client-generated UUID primary keys — already in the schema
above — make this idempotent and conflict-free.

---

## 7. Cost control

The vision call is the only per-use cost. Three levers, in order of impact:

1. **Downscale before sending.** ~768px on the long edge is plenty to identify a gym
   machine and cuts image tokens dramatically versus a 12MP camera original. Biggest win
   available, and it also makes the request faster.
2. **Use a small vision model.** Equipment ID from a closed set of ~50 is an easy task;
   it does not need a frontier model. Benchmark the cheap one first against your `scan`
   data and only move up if accuracy demands it.
3. **Cache content, not inference.** Exercise content is served from our Postgres, so
   ExerciseDB is hit during seeding and refresh jobs, not per scan.

Set a hard spend cap on the OpenAI account before the first TestFlight build.

---

## 8. Roadmap

**Phase 0 — foundation**
Expo app scaffold, Supabase project, schema + RLS migrations, anonymous auth,
CI (typecheck/lint), EAS build config.

**Phase 1 — the scan loop**
Camera screen, client-side downscale, `/identify-equipment` Edge Function, result screen,
low-confidence disambiguation UI, async photo upload + `scan` insert.

**Phase 2 — content**
Seed ~50 equipment entries (covers the large majority of a commercial gym), ingest
ExerciseDB into `exercise`, build the `equipment_exercise` mapping, video playback UI.

**Phase 3 — retention hooks (still MVP)**
"Machines I've met" history from `scan`, save/favourite equipment, share a scan result.

**Phase 4 — day 2**
Workout logging on `workout`/`workout_set`, offline queue, progression charts,
then AI plan generation grounded in the user's real logged history.

---

## 9. Open questions

- **Catalog scope.** ~50 machine types covers most of a commercial gym. Which 50 depends
  on the gyms you're targeting — a boutique studio and a Planet Fitness differ. Worth
  walking a real gym with a notebook before seeding.
- **Confidence threshold.** Needs tuning against real photos: bad angles, crowded frames,
  someone using the machine, poor lighting. The `scan.was_correct` feedback loop is how
  you measure it.
- **ExerciseDB commercial terms.** Confirm the licence permits redistributing their
  videos/GIFs in a commercial app, and whether caching into our own DB is allowed, before
  Phase 2. This is a blocker on content, not on the scan loop.
