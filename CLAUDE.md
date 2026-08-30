# Reppy

React Native (Expo) app. A gym beginner photographs a machine; the app identifies it
and shows what it is, how to set it up, and demo videos.

Full reasoning lives in `docs/ARCHITECTURE.md`. The decisions below are load-bearing —
each was made for a reason that is not obvious from the code alone.

## Three runtimes, three type environments

| Path | Runtime | Typechecked by |
|---|---|---|
| `app/`, `src/` | React Native | root `tsconfig.json` |
| `scripts/` | Node | `scripts/tsconfig.json` |
| `supabase/functions/` | Deno | not typechecked locally |

`npm run typecheck` covers the first two. Do not merge these configs — `@types/node`
does not resolve under Expo's `react-native` custom condition, which is why they are
split.

## Vision identification

- The model classifies into a **closed set** of equipment slugs, built from the
  `equipment` table at request time and passed as a JSON-schema enum. Never accept a
  free-text equipment name — it will not join to content.
- Images go to the model as **inline base64**. Do not upload to Storage first; that
  adds a round trip to the critical path. The photo is persisted afterwards via
  `EdgeRuntime.waitUntil`.
- Downscale to ~768px client-side before sending. This is the main cost and latency
  lever.
- Low confidence shows a disambiguation picker rather than asserting an answer. The
  correction is recorded on `scan.was_correct`.

## Secrets

- The OpenAI key and the Supabase service-role key live **only** in Edge Function
  secrets. Anything prefixed `EXPO_PUBLIC_` is compiled into the bundle and is
  extractable from a shipped build.
- The Supabase publishable/anon key is safe in the client by design. **Row Level
  Security is what protects data** — enable it on every new user-owned table in the
  same migration that creates the table.

## Content

- Sources sit behind adapters (`scripts/ingest/adapters.ts`, `src/lib/media.ts`).
  Never hardcode a provider — the source choice is deliberately reversible.
- Equipment→exercise matching runs on exercise **names**, not the source's own
  equipment field, which is far too coarse (one value spans dozens of machines). That
  field is used only as a negative filter, via `allowSource`.
- Ingest writes `curated_by = 'auto'`. Rows promoted to `'human'` must never be
  overwritten by a later run.
- `equipment_media` rows are ranked; the resolver falls through to the next source
  when one fails. Preserve that behaviour.

## Never fabricate content

Do not invent YouTube video IDs, exercise data, or media URLs. An ID that looks real
and resolves to nothing is worse than an empty table. Curated videos come from
`content/walkthroughs.csv`, filled in by a human.

## Day-2 tables already exist

`workout` and `workout_set` are created and RLS-protected but unused. Workout logging
should extend them rather than introduce new tables.
