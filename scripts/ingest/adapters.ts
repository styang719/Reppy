import type { NormalisedExercise, SourceAdapter } from './types';

const asArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

/**
 * ExerciseDB. Requires EXERCISEDB_API_KEY.
 *
 * Confirm the licence permits redistributing their media in a commercial app
 * and caching it in your own database before relying on this in production.
 */
export const exerciseDbAdapter: SourceAdapter = {
  name: 'exercisedb',
  async fetchAll(): Promise<NormalisedExercise[]> {
    const apiKey = process.env.EXERCISEDB_API_KEY;
    const baseUrl = process.env.EXERCISEDB_BASE_URL ?? 'https://www.exercisedb.dev/api/v1';
    if (!apiKey) throw new Error('EXERCISEDB_API_KEY is not set');

    const out: NormalisedExercise[] = [];
    let offset = 0;
    const limit = 100;

    // Paginate until a short page comes back.
    for (;;) {
      const res = await fetch(`${baseUrl}/exercises?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error(`ExerciseDB ${res.status}: ${await res.text()}`);

      const payload = (await res.json()) as { data?: any[] } | any[];
      const rows: any[] = Array.isArray(payload) ? payload : (payload.data ?? []);
      if (!rows.length) break;

      for (const r of rows) {
        out.push({
          source: 'exercisedb',
          source_id: String(r.exerciseId ?? r.id),
          name: r.name,
          video_url: r.videoUrl ?? null,
          image_url: r.imageUrl ?? r.gifUrl ?? null,
          instructions: asArray(r.instructions),
          target_muscles: asArray(r.targetMuscles ?? r.target),
          body_parts: asArray(r.bodyParts ?? r.bodyPart),
          source_equipment: asArray(r.equipments ?? r.equipment),
          raw: r,
        });
      }

      if (rows.length < limit) break;
      offset += limit;
    }

    return out;
  },
};

/**
 * free-exercise-db — public domain, ~800 exercises, no API key.
 * The fallback if ExerciseDB's terms don't work out.
 */
export const freeExerciseDbAdapter: SourceAdapter = {
  name: 'free-exercise-db',
  async fetchAll(): Promise<NormalisedExercise[]> {
    const base = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
    const res = await fetch(`${base}/dist/exercises.json`);
    if (!res.ok) throw new Error(`free-exercise-db ${res.status}`);

    const rows = (await res.json()) as any[];
    return rows.map((r) => ({
      source: 'free-exercise-db',
      source_id: String(r.id),
      // This dataset has images, not video.
      video_url: null,
      image_url: r.images?.[0] ? `${base}/exercises/${r.images[0]}` : null,
      name: r.name,
      instructions: asArray(r.instructions),
      target_muscles: asArray(r.primaryMuscles),
      body_parts: asArray(r.primaryMuscles),
      source_equipment: r.equipment ? [String(r.equipment)] : [],
      raw: r,
    }));
  },
};

export const adapters: Record<string, SourceAdapter> = {
  exercisedb: exerciseDbAdapter,
  'free-exercise-db': freeExerciseDbAdapter,
};
