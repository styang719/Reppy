/**
 * Loads curated machine walkthroughs from content/walkthroughs.csv.
 *
 *   npx tsx scripts/curate/media.ts --dry-run
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run curate
 *
 * Rows with an empty youtube_id are skipped, so the file can be filled in over
 * several sittings and re-run safely. Existing rows are updated rather than
 * duplicated.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const CSV_PATH = join(process.cwd(), 'content', 'walkthroughs.csv');
const dryRun = process.argv.includes('--dry-run');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 11 chars of [A-Za-z0-9_-]. Catches a pasted full URL before it reaches the DB.
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

type Row = {
  equipment_slug: string;
  youtube_id: string;
  title: string;
  attribution: string;
  rank: number;
};

function parseCsv(text: string): Row[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('equipment_slug,'))
    .map((line, i) => {
      const [equipment_slug, youtube_id, title, attribution, rank] = line.split(',');
      if (!equipment_slug) throw new Error(`Row ${i + 1}: missing equipment_slug`);
      return {
        equipment_slug: equipment_slug.trim(),
        youtube_id: (youtube_id ?? '').trim(),
        title: (title ?? '').trim(),
        attribution: (attribution ?? '').trim(),
        rank: Number(rank) || 100,
      };
    });
}

async function main() {
  const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'));
  const filled = rows.filter((r) => r.youtube_id);
  const empty = rows.length - filled.length;

  console.log(`${rows.length} rows, ${filled.length} with a video id, ${empty} still blank\n`);

  const bad = filled.filter((r) => !YOUTUBE_ID.test(r.youtube_id));
  if (bad.length) {
    console.error('These do not look like YouTube video ids (expect 11 characters):');
    bad.forEach((r) => console.error(`  ${r.equipment_slug}: "${r.youtube_id}"`));
    console.error('\nPaste only the id, not the whole URL.');
    process.exit(1);
  }

  if (!filled.length) {
    console.log('Nothing to load yet. Fill in youtube_id values in content/walkthroughs.csv.');
    return;
  }

  filled.forEach((r) => console.log(`  ${r.equipment_slug.padEnd(26)} ${r.youtube_id}  ${r.title}`));

  if (dryRun) {
    console.log('\n--dry-run: nothing written.');
    return;
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: equipment, error } = await db.from('equipment').select('id, slug');
  if (error) throw error;
  const idBySlug = new Map(equipment!.map((e: any) => [e.slug, e.id as string]));

  const payload = [];
  for (const r of filled) {
    const equipmentId = idBySlug.get(r.equipment_slug);
    if (!equipmentId) {
      console.warn(`  skipping "${r.equipment_slug}" — no such equipment slug`);
      continue;
    }
    payload.push({
      equipment_id: equipmentId,
      kind: 'walkthrough',
      source: 'youtube',
      source_id: r.youtube_id,
      title: r.title || 'How to use it',
      attribution: r.attribution || null,
      rank: r.rank,
      is_active: true,
    });
  }

  const { error: upsertError } = await db
    .from('equipment_media')
    .upsert(payload, { onConflict: 'equipment_id,source,source_id' });
  if (upsertError) throw upsertError;

  console.log(`\nLoaded ${payload.length} walkthrough videos.`);
}

main().catch((e) => {
  console.error('\nFailed:', e.message ?? e);
  process.exit(1);
});
