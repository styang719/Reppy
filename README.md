# Reppy

Point your camera at a gym machine, find out what it is and how to use it.

Reppy is for people who've just joined a gym and find the equipment floor
intimidating. Take a photo of any machine and get back what it's called, what it
works, how to set it up, and short demo videos of exercises you can do on it.

## Status

Early. Architecture is settled; implementation hasn't started.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the design, data model, and
roadmap.

## Stack

- **App** — Expo (React Native) + TypeScript
- **Backend** — Supabase (Postgres, Auth, Storage, Edge Functions)
- **Vision** — OpenAI vision model, called server-side only
- **Content** — ExerciseDB, cached into Postgres

## Getting started

```bash
npm install
cp .env.example .env      # fill in your Supabase project URL and publishable key
npm start
```

### Backend

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push                                  # schema, RLS, storage, seed
npx supabase secrets set OPENAI_API_KEY=sk-...        # never commit this
npx supabase functions deploy identify-equipment
```

Regenerate database types after any schema change:

```bash
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

### Layout

```
app/                     screens (expo-router)
src/lib/                 supabase client, queries, identify pipeline
src/theme/               design tokens
supabase/migrations/     schema, RLS, storage, seed data
supabase/functions/      Edge Functions (Deno)
docs/ARCHITECTURE.md     design decisions and roadmap
```
