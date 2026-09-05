import { createClient } from '@supabase/supabase-js';

export type CatalogEntry = { slug: string; display_name: string; aliases: string[] };

/**
 * Fallback catalog, generated from the seed migrations.
 *
 * The harness prefers the live database, because a stale copy here would report
 * an accuracy the deployed function does not actually have. This list exists
 * only so the harness still runs with no Supabase credentials to hand.
 */
export const STATIC_CATALOG: CatalogEntry[] = [
  { slug: 'lat-pulldown', display_name: 'Lat Pulldown', aliases: ['pulldown machine', 'lat machine', 'pull down'] },
  { slug: 'seated-cable-row', display_name: 'Seated Cable Row', aliases: ['cable row', 'low row', 'seated row'] },
  { slug: 'chest-press-machine', display_name: 'Chest Press Machine', aliases: ['seated chest press', 'machine bench press'] },
  { slug: 'leg-press', display_name: 'Leg Press', aliases: ['45 degree leg press', 'sled press', 'leg press machine'] },
  { slug: 'leg-extension', display_name: 'Leg Extension', aliases: ['knee extension', 'quad machine'] },
  { slug: 'seated-leg-curl', display_name: 'Seated Leg Curl', aliases: ['leg curl', 'hamstring curl', 'hamstring machine'] },
  { slug: 'smith-machine', display_name: 'Smith Machine', aliases: ['smith rack', 'guided barbell'] },
  { slug: 'cable-crossover', display_name: 'Cable Crossover', aliases: ['cable machine', 'functional trainer', 'dual pulley'] },
  { slug: 'shoulder-press-machine', display_name: 'Shoulder Press Machine', aliases: ['overhead press machine', 'military press machine'] },
  { slug: 'treadmill', display_name: 'Treadmill', aliases: ['running machine', 'cardio treadmill'] },
  { slug: 'dumbbell-rack', display_name: 'Dumbbell Rack', aliases: ['free weights', 'dumbbells', 'dumbbell stand'] },
  { slug: 'pec-deck', display_name: 'Pec Deck', aliases: ['chest fly machine', 'butterfly machine', 'rear delt fly'] },
  { slug: 'seated-leg-press', display_name: 'Seated Leg Press', aliases: ['horizontal leg press', 'cybex leg press', 'seated leg press machine'] },
  { slug: 'flat-bench-press', display_name: 'Flat Bench Press', aliases: ['bench press', 'olympic bench', 'barbell bench', 'flat bench'] },
  { slug: 'plate-loaded-row', display_name: 'Plate-Loaded Row', aliases: ['iso-lateral row', 'hammer strength row', 'plate loaded row', 'chest supported row'] },
  { slug: 'squat-rack', display_name: 'Squat Rack', aliases: ['power rack', 'squat cage', 'power cage', 'half rack'] },
  { slug: 'hip-abduction', display_name: 'Hip Abduction Machine', aliases: ['outer thigh machine', 'abductor machine', 'hip abductor'] },
  { slug: 'hip-adduction', display_name: 'Hip Adduction Machine', aliases: ['inner thigh machine', 'adductor machine', 'hip adductor'] },
  { slug: 'back-extension', display_name: 'Back Extension Bench', aliases: ['hyperextension bench', '45 degree back extension', 'roman chair back extension'] },
  { slug: 'glute-ham-developer', display_name: 'Glute-Ham Developer', aliases: ['GHD', 'glute ham raise', 'ghd machine'] },
  { slug: 'hip-thrust-machine', display_name: 'Hip Thrust Machine', aliases: ['glute drive', 'glute bridge machine', 'hip thrust'] },
  { slug: 'seated-calf-raise', display_name: 'Seated Calf Raise', aliases: ['calf raise machine', 'seated calf machine'] },
  { slug: 'standing-calf-raise', display_name: 'Standing Calf Raise', aliases: ['calf raise', 'standing calf machine'] },
  { slug: 'hack-squat', display_name: 'Hack Squat Machine', aliases: ['hack squat', 'sled hack squat'] },
  { slug: 'lying-leg-curl', display_name: 'Lying Leg Curl', aliases: ['prone leg curl', 'lying hamstring curl'] },
  { slug: 'glute-kickback', display_name: 'Glute Kickback Machine', aliases: ['kickback machine', 'glute machine', 'hip extension machine'] },
  { slug: 'assisted-pull-up', display_name: 'Assisted Pull-Up Machine', aliases: ['chin dip assist', 'assisted chin up', 'gravitron'] },
  { slug: 't-bar-row', display_name: 'T-Bar Row', aliases: ['landmine row', 'chest supported t-bar'] },
  { slug: 'chest-supported-row', display_name: 'Chest-Supported Row', aliases: ['incline row machine', 'seal row', 'prone row'] },
  { slug: 'pull-up-bar', display_name: 'Pull-Up Bar', aliases: ['chin up bar', 'pullup station'] },
  { slug: 'iso-lateral-pulldown', display_name: 'Iso-Lateral Pulldown', aliases: ['hammer strength pulldown', 'plate loaded pulldown', 'independent pulldown'] },
  { slug: 'incline-bench-press', display_name: 'Incline Bench Press', aliases: ['incline barbell bench', 'incline press'] },
  { slug: 'adjustable-bench', display_name: 'Adjustable Bench', aliases: ['flat bench', 'incline bench', 'utility bench'] },
  { slug: 'rear-delt-fly', display_name: 'Rear Delt Fly Machine', aliases: ['reverse pec deck', 'rear delt machine', 'reverse fly'] },
  { slug: 'lateral-raise-machine', display_name: 'Lateral Raise Machine', aliases: ['side raise machine', 'shoulder lateral machine'] },
  { slug: 'dip-station', display_name: 'Dip Station', aliases: ['parallel bars', 'dip bars', 'triceps dip'] },
  { slug: 'preacher-curl-bench', display_name: 'Preacher Curl Bench', aliases: ['preacher bench', 'scott bench', 'arm curl bench'] },
  { slug: 'bicep-curl-machine', display_name: 'Bicep Curl Machine', aliases: ['arm curl machine', 'seated curl machine'] },
  { slug: 'tricep-extension-machine', display_name: 'Triceps Extension Machine', aliases: ['tricep machine', 'seated tricep extension', 'triceps press'] },
  { slug: 'ab-crunch-machine', display_name: 'Ab Crunch Machine', aliases: ['abdominal machine', 'crunch machine', 'ab machine'] },
  { slug: 'rotary-torso', display_name: 'Rotary Torso Machine', aliases: ['torso rotation', 'oblique machine', 'twist machine'] },
  { slug: 'roman-chair', display_name: 'Roman Chair', aliases: ['captains chair', 'vertical knee raise', 'VKR'] },
  { slug: 'elliptical', display_name: 'Elliptical Trainer', aliases: ['cross trainer', 'elliptical machine'] },
  { slug: 'upright-bike', display_name: 'Upright Exercise Bike', aliases: ['stationary bike', 'exercise bike', 'upright cycle'] },
  { slug: 'recumbent-bike', display_name: 'Recumbent Bike', aliases: ['reclining bike', 'seated bike'] },
  { slug: 'rowing-machine', display_name: 'Rowing Machine', aliases: ['rower', 'erg', 'concept 2'] },
  { slug: 'stair-climber', display_name: 'Stair Climber', aliases: ['stairmaster', 'step mill', 'stepper'] },
  { slug: 'functional-trainer', display_name: 'Functional Trainer', aliases: ['dual adjustable pulley', 'cable station', 'cable tower'] },
  { slug: 'kettlebell-rack', display_name: 'Kettlebell Rack', aliases: ['kettlebells', 'kettlebell stand'] },
  { slug: 'weight-plate-tree', display_name: 'Weight Plate Tree', aliases: ['plate rack', 'plate tree', 'weight plates'] },
  { slug: 'sled-push', display_name: 'Push Sled', aliases: ['prowler', 'weight sled', 'sled'] },
];

/** Reads the live catalog when credentials allow, else falls back. */
export async function loadCatalog(): Promise<{ entries: CatalogEntry[]; source: string }> {
  const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return { entries: STATIC_CATALOG, source: 'static (no credentials)' };

  try {
    const db = createClient(url, key);
    const { data, error } = await db
      .from('equipment')
      .select('slug, display_name, aliases')
      .eq('is_active', true);

    if (error || !data?.length) return { entries: STATIC_CATALOG, source: 'static (query failed)' };

    return {
      entries: data.map((e: any) => ({
        slug: e.slug,
        display_name: e.display_name,
        aliases: e.aliases ?? [],
      })),
      source: 'live database',
    };
  } catch {
    return { entries: STATIC_CATALOG, source: 'static (connection failed)' };
  }
}
