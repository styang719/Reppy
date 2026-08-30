/**
 * The equipment catalog as the eval harness sees it.
 *
 * Deliberately a plain list rather than a database read, so the harness runs
 * with nothing deployed. Keep it in step with the seed migrations.
 */
export const CATALOG: { slug: string; display_name: string; aliases: string[] }[] = [
  { slug: 'lat-pulldown', display_name: 'Lat Pulldown', aliases: ['pulldown machine', 'lat machine'] },
  { slug: 'seated-cable-row', display_name: 'Seated Cable Row', aliases: ['cable row', 'low row'] },
  { slug: 'chest-press-machine', display_name: 'Chest Press Machine', aliases: ['seated chest press'] },
  { slug: 'leg-press', display_name: 'Leg Press (45° Sled)', aliases: ['45 degree leg press', 'sled press'] },
  { slug: 'seated-leg-press', display_name: 'Seated Leg Press', aliases: ['horizontal leg press'] },
  { slug: 'leg-extension', display_name: 'Leg Extension', aliases: ['knee extension', 'quad machine'] },
  { slug: 'seated-leg-curl', display_name: 'Seated Leg Curl', aliases: ['leg curl', 'hamstring curl'] },
  { slug: 'smith-machine', display_name: 'Smith Machine', aliases: ['smith rack', 'guided barbell'] },
  { slug: 'cable-crossover', display_name: 'Cable Crossover', aliases: ['functional trainer', 'dual pulley'] },
  { slug: 'shoulder-press-machine', display_name: 'Shoulder Press Machine', aliases: ['overhead press machine'] },
  { slug: 'treadmill', display_name: 'Treadmill', aliases: ['running machine'] },
  { slug: 'dumbbell-rack', display_name: 'Dumbbell Rack', aliases: ['free weights', 'dumbbells'] },
  { slug: 'pec-deck', display_name: 'Pec Deck', aliases: ['chest fly machine', 'butterfly machine'] },
  { slug: 'flat-bench-press', display_name: 'Flat Bench Press', aliases: ['bench press', 'olympic bench'] },
  { slug: 'plate-loaded-row', display_name: 'Plate-Loaded Row', aliases: ['iso-lateral row', 'hammer strength row'] },
  { slug: 'squat-rack', display_name: 'Squat Rack', aliases: ['power rack', 'squat cage'] },
];
