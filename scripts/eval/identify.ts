/**
 * Vision accuracy harness.
 *
 *   OPENAI_API_KEY=sk-... npx tsx scripts/eval/identify.ts ./photos
 *   OPENAI_API_KEY=sk-... npx tsx scripts/eval/identify.ts ./photos --model=gpt-4o
 *
 * Runs the same prompt and closed-set schema as the identify-equipment Edge
 * Function, so results here predict what the app will do. Keeping the two in
 * step matters — a harness that drifts from production measures nothing.
 *
 * Label expected answers by filename prefix to get an accuracy score:
 *   leg-press__gym1.jpg       → expected "leg-press"
 *   flat-bench-press__b.jpg   → expected "flat-bench-press"
 * Unlabelled files are still identified, just not scored.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { CATALOG } from './catalog';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--')) ?? './photos';
const model = args.find((a) => a.startsWith('--model='))?.split('=')[1] ?? 'gpt-4o-mini';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not set.');
  process.exit(1);
}

const SYSTEM_PROMPT = `You identify gym equipment in photographs for an app that helps beginners.

You will be given a photo taken inside a gym and a list of known equipment slugs.
Choose the single slug that best matches the main piece of equipment in the photo.

Rules:
- Only ever return a slug from the provided list.
- If the photo shows no gym equipment, is too blurry or dark to judge, or shows
  something not in the list, return null for equipment_slug with low confidence.
- confidence reflects how sure you are: 0.9+ means unmistakable, below 0.6 means
  you are guessing between similar machines.
- Put genuinely plausible runner-up slugs in alternatives, closest first.
  Machines that look alike (lat pulldown vs. seated cable row) belong here.`;

const slugs = CATALOG.map((e) => e.slug);
const catalogForPrompt = CATALOG.map(
  (e) => `- ${e.slug}: ${e.display_name}${e.aliases.length ? ` (also called: ${e.aliases.join(', ')})` : ''}`
).join('\n');

type Result = {
  file: string;
  expected: string | null;
  got: string | null;
  confidence: number;
  alternatives: string[];
  ms: number;
};

async function identify(path: string): Promise<Omit<Result, 'file' | 'expected'>> {
  const b64 = readFileSync(path).toString('base64');
  const started = Date.now();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Known equipment:\n${catalogForPrompt}` },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}`, detail: 'low' } },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'equipment_identification',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              equipment_slug: { type: ['string', 'null'], enum: [...slugs, null] },
              confidence: { type: 'number' },
              alternatives: { type: 'array', items: { type: 'string', enum: slugs } },
            },
            required: ['equipment_slug', 'confidence', 'alternatives'],
            additionalProperties: false,
          },
        },
      },
      max_tokens: 300,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);

  const json: any = await res.json();
  const parsed = JSON.parse(json.choices[0].message.content);
  return {
    got: parsed.equipment_slug,
    confidence: parsed.confidence,
    alternatives: parsed.alternatives ?? [],
    ms: Date.now() - started,
  };
}

async function main() {
  const files = readdirSync(dir)
    .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
    .filter((f) => statSync(join(dir, f)).isFile());

  if (!files.length) {
    console.error(`No images in ${dir}`);
    process.exit(1);
  }

  console.log(`Model: ${model}   Catalog: ${slugs.length} slugs   Photos: ${files.length}\n`);

  const results: Result[] = [];
  for (const file of files) {
    const expected = file.includes('__') ? basename(file).split('__')[0] : null;
    try {
      const r = await identify(join(dir, file));
      results.push({ file, expected, ...r });

      const mark = expected === null ? ' ' : r.got === expected ? '✓' : '✗';
      const conf = r.confidence.toFixed(2);
      console.log(`${mark} ${file.padEnd(34)} → ${(r.got ?? 'NULL').padEnd(24)} ${conf}  ${r.ms}ms`);
      if (r.alternatives.length) console.log(`    alternatives: ${r.alternatives.join(', ')}`);
    } catch (err: any) {
      console.log(`! ${file.padEnd(34)} → ERROR: ${err.message}`);
    }
  }

  const scored = results.filter((r) => r.expected !== null);
  if (scored.length) {
    const correct = scored.filter((r) => r.got === r.expected);
    const pct = ((correct.length / scored.length) * 100).toFixed(0);
    console.log(`\nAccuracy: ${correct.length}/${scored.length} (${pct}%)`);

    const missed = scored.filter((r) => r.got !== r.expected);
    if (missed.length) {
      console.log('\nMisses:');
      for (const m of missed) {
        const rescued = m.alternatives.includes(m.expected!) ? '  (correct answer was in alternatives)' : '';
        console.log(`  ${m.file}: expected ${m.expected}, got ${m.got ?? 'NULL'}${rescued}`);
      }
    }
  }

  // A null result means the catalog has a gap — the most actionable output here.
  const nulls = results.filter((r) => r.got === null);
  if (nulls.length) {
    console.log(`\n${nulls.length} photo(s) matched nothing in the catalog:`);
    nulls.forEach((n) => console.log(`  ${n.file}`));
    console.log('  → these are the machines to add next.');
  }

  const lowConf = results.filter((r) => r.got !== null && r.confidence < 0.6);
  if (lowConf.length) {
    console.log(`\n${lowConf.length} low-confidence result(s) — the disambiguation UI would show:`);
    lowConf.forEach((l) => console.log(`  ${l.file}: ${l.got} @ ${l.confidence.toFixed(2)}`));
  }

  const avg = results.reduce((s, r) => s + r.ms, 0) / (results.length || 1);
  console.log(`\nMean latency: ${avg.toFixed(0)}ms`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
