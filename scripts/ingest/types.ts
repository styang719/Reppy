/**
 * A source-neutral exercise record.
 *
 * Every adapter normalises into this shape, so switching content providers
 * touches one file and nothing downstream. That matters because the choice
 * between ExerciseDB and free-exercise-db turns on licence terms, not on
 * anything technical.
 */
export type NormalisedExercise = {
  source: string;
  source_id: string;
  name: string;
  video_url: string | null;
  image_url: string | null;
  instructions: string[];
  target_muscles: string[];
  body_parts: string[];
  /** Whatever the source called the equipment. Coarse; used only as a hint. */
  source_equipment: string[];
  raw: unknown;
};

export type SourceAdapter = {
  name: string;
  /** Fetches and normalises the full catalog. */
  fetchAll: () => Promise<NormalisedExercise[]>;
};
