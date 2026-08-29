-- Reppy initial schema. See docs/ARCHITECTURE.md for the reasoning.

create extension if not exists "pgcrypto";

-- ── Content catalog (public read) ────────────────────────────────────────────

-- Our own equipment vocabulary. The vision model classifies into exactly this
-- set of slugs; free-text names would never join reliably to content.
create table public.equipment (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  display_name    text not null,
  aliases         text[] not null default '{}',
  category        text not null check (category in
                    ('cable','plate-loaded','selectorized','cardio','free-weight','rack')),
  primary_muscles text[] not null default '{}',
  description     text,
  how_to_setup    text,
  common_mistakes text[] not null default '{}',
  difficulty      smallint check (difficulty between 1 and 3),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- Content cached from ExerciseDB (or hand-authored). `raw` keeps the full
-- payload so new fields can be derived later without re-fetching.
create table public.exercise (
  id             uuid primary key default gen_random_uuid(),
  source         text not null default 'exercisedb',
  source_id      text,
  name           text not null,
  video_url      text,
  image_url      text,
  instructions   text[] not null default '{}',
  target_muscles text[] not null default '{}',
  body_parts     text[] not null default '{}',
  raw            jsonb,
  fetched_at     timestamptz not null default now(),
  unique (source, source_id)
);

-- The curated mapping. ExerciseDB's own `equipments` vocabulary is too coarse
-- to filter on (one value such as "LEVERAGE MACHINE" spans dozens of distinct
-- machines), so the equipment→exercise relationship is curated here instead.
create table public.equipment_exercise (
  equipment_id uuid not null references public.equipment on delete cascade,
  exercise_id  uuid not null references public.exercise  on delete cascade,
  rank         smallint not null default 100,
  is_beginner  boolean not null default false,
  curated_by   text not null default 'auto' check (curated_by in ('auto','human')),
  primary key (equipment_id, exercise_id)
);

create index equipment_exercise_equipment_idx
  on public.equipment_exercise (equipment_id, rank);

-- ── User data ────────────────────────────────────────────────────────────────

-- Every scan: user history, model eval set, and catalog-expansion signal.
create table public.scan (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade,
  image_path   text,
  equipment_id uuid references public.equipment on delete set null,
  confidence   real,
  alternatives jsonb,
  model        text,
  latency_ms   integer,
  was_correct  boolean,
  created_at   timestamptz not null default now()
);

create index scan_user_created_idx on public.scan (user_id, created_at desc);

-- ── Day 2: workout logging. Created now so logging is additive. ──────────────

create table public.workout (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  started_at timestamptz not null default now(),
  ended_at   timestamptz,
  notes      text
);

create index workout_user_started_idx on public.workout (user_id, started_at desc);

create table public.workout_set (
  id           uuid primary key default gen_random_uuid(),
  workout_id   uuid not null references public.workout on delete cascade,
  exercise_id  uuid references public.exercise  on delete set null,
  equipment_id uuid references public.equipment on delete set null,
  set_index    smallint not null,
  weight_kg    numeric(6,2),
  reps         smallint,
  rpe          numeric(3,1) check (rpe between 1 and 10),
  completed_at timestamptz not null default now()
);

create index workout_set_workout_idx on public.workout_set (workout_id, set_index);
