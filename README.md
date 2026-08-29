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
