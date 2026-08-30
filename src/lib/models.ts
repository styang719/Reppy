import type { Database } from './database.types';

/**
 * Application-facing names for the database row types.
 *
 * `database.types.ts` is generated — `npm run db:types` overwrites it wholesale —
 * so nothing hand-written may live there. These aliases derive from the generated
 * `Database` type instead, which means regenerating after a migration updates them
 * automatically and any mismatch surfaces as a typecheck failure rather than at
 * runtime.
 */

type Tables = Database['public']['Tables'];

export type Equipment = Tables['equipment']['Row'];
export type Exercise = Tables['exercise']['Row'];
export type EquipmentMedia = Tables['equipment_media']['Row'];
export type EquipmentExercise = Tables['equipment_exercise']['Row'];
export type Scan = Tables['scan']['Row'];
export type Workout = Tables['workout']['Row'];
export type WorkoutSet = Tables['workout_set']['Row'];

/**
 * Postgres CHECK constraints do not survive type generation — the columns come
 * back as plain `string`. These unions are the app-side mirror and must be kept
 * in step with the constraints in supabase/migrations.
 */

export type EquipmentCategory =
  | 'cable'
  | 'plate-loaded'
  | 'selectorized'
  | 'cardio'
  | 'free-weight'
  | 'rack';

export type MediaKind = 'walkthrough' | 'exercise-demo' | 'form-tip';

export type MediaSource =
  | 'youtube'
  | 'free-exercise-db'
  | 'exercisedb'
  | 'musclewiki'
  | 'manual';
