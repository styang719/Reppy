/**
 * Content ingest.
 *
 *   npx tsx scripts/ingest/run.ts --source=free-exercise-db
 *   npx tsx scripts/ingest/run.ts --source=exercisedb --dry-run
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role bypasses RLS,
 * which is required to write the public catalog). Run it from your machine or
 * CI — never from the app.
 */

import { createClient } from '@supabase/supabase-js';
import { adapters } from './adapters';
import { MAPPING, matchesEquipment } from './mapping';
import type { NormalisedExercise } from './types';

const args = process.argv.slice(2);
const sourceName = args.find((a) => a.startsWith('--source='))?.split('=')[1] ?? 'free-exercise-db';
const dryRun = args.includes('--dry-run');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const adapter = adapters[sourceName];
  if (!adapter) {
    throw new Error(`Unknown source "${sourceName}". Options: ${Object.keys(adapters).join(', ')}`);
  }

  if (!dryRun && (!SUPABASE_URL || !SERVICE_ROLE_KEY)) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (or pass --dry-run)');
  }

  console.log(`Fetching from ${adapter.name}…`);
  const all = await adapter.fetchAll();
  console.log(`  ${all.length} exercises fetched`);

  // Keep only what maps to equipment we actually have. No point storing 11,000
  // rows when the catalog is 12 machines.
  const selected = new Map<string, { exercise: NormalisedExercise; slugs: string[] }>();

  for (const [slug, rule] of Object.entries(MAPPING)) {
    const matches = all
      .filter((e) => matchesEquipment(e.name, rule, e.source_equipment))
      .slice(0, rule.limit ?? 10);

    for (const exercise of matches) {
      const key = `${exercise.source}:${exercise.source_id}`;
      const existing = selected.get(key);
      if (existing) existing.slugs.push(slug);
      else selected.set(key, { exercise, slugs: [slug] });
    }

    const label = matches.length ? `${matches.length} matched` : 'NO MATCHES';
    console.log(`  ${slug.padEnd(26)} ${label}`);
  }

  console.log(`\n${selected.size} unique exercises to ingest`);

  if (dryRun) {
    console.log('\n--dry-run: nothing written. Sample:');
    for (const { exercise, slugs } of Array.from(selected.values()).slice(0, 10)) {
      console.log(`  ${exercise.name}  →  ${slugs.join(', ')}`);
    }
    return;
  }

  const db = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

  const { data: equipmentRows, error: equipmentError } = await db
    .from('equipment')
    .select('id, slug');
  if (equipmentError) throw equipmentError;

  const idBySlug = new Map(equipmentRows!.map((r: any) => [r.slug, r.id as string]));

  // Upsert exercises, then read back the ids the database assigned.
  const payload = Array.from(selected.values()).map(({ exercise }) => ({
    source: exercise.source,
    source_id: exercise.source_id,
    name: exercise.name,
    video_url: exercise.video_url,
    image_url: exercise.image_url,
    instructions: exercise.instructions,
    target_muscles: exercise.target_muscles,
    body_parts: exercise.body_parts,
    raw: exercise.raw,
    fetched_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await db
    .from('exercise')
    .upsert(payload, { onConflict: 'source,source_id' });
  if (upsertError) throw upsertError;
  console.log(`Upserted ${payload.length} exercises`);

  const { data: stored, error: storedError } = await db
    .from('exercise')
    .select('id, source, source_id')
    .eq('source', adapter.name);
  if (storedError) throw storedError;

  const exerciseIdByKey = new Map(
    stored!.map((r: any) => [`${r.source}:${r.source_id}`, r.id as string])
  );

  const links: any[] = [];
  for (const [key, { slugs }] of selected) {
    const exerciseId = exerciseIdByKey.get(key);
    if (!exerciseId) continue;

    for (const slug of slugs) {
      const equipmentId = idBySlug.get(slug);
      if (!equipmentId) {
        console.warn(`  skipping "${slug}" — not in the equipment table`);
        continue;
      }
      links.push({
        equipment_id: equipmentId,
        exercise_id: exerciseId,
        rank: 100,
        curated_by: 'auto',
      });
    }
  }

  // ignoreDuplicates preserves any row a human has already curated.
  const { error: linkError } = await db
    .from('equipment_exercise')
    .upsert(links, { onConflict: 'equipment_id,exercise_id', ignoreDuplicates: true });
  if (linkError) throw linkError;

  console.log(`Linked ${links.length} equipment↔exercise pairs`);
  console.log('\nDone. These are curated_by=auto — review before shipping.');
}

main().catch((err) => {
  console.error('\nIngest failed:', err.message ?? err);
  process.exit(1);
});
