/**
 * Equipment → exercise matching rules.
 *
 * Content sources describe equipment far too coarsely to filter on: one
 * ExerciseDB value such as "LEVERAGE MACHINE" spans dozens of physically
 * distinct machines. So we match on exercise *names* instead, per equipment
 * slug, and treat the source's own equipment field as a weak hint at best.
 *
 * Everything produced here lands with curated_by = 'auto'. It is a first pass,
 * not a finished catalog — review it and promote good rows to 'human'. Rows
 * marked 'human' are never overwritten by a later ingest.
 */

export type EquipmentBucket = 'machine' | 'cable' | 'barbell' | 'dumbbell' | 'bodyweight' | 'other';

export type MappingRule = {
  /** Exercise name must match one of these. */
  include: RegExp[];
  /** ...and none of these. */
  exclude?: RegExp[];
  /**
   * Buckets the source's own equipment field may fall into.
   *
   * That field is far too coarse to select on — "machine" spans the whole gym
   * floor — but it is precise enough to *reject* on. A "Shoulder Press" tagged
   * `dumbbell` is definitively not done on the shoulder press machine, whatever
   * its name says.
   */
  allowSource?: EquipmentBucket[];
  /** Cap per equipment, so one machine doesn't pull in 200 rows. */
  limit?: number;
};

/** Folds each source's own equipment vocabulary into shared buckets. */
export function normaliseSourceEquipment(raw: string): EquipmentBucket {
  const v = raw.toLowerCase();
  if (/machine|leverage|sled|smith/.test(v)) return 'machine';
  if (/cable|pulley/.test(v)) return 'cable';
  if (/barbell|ez|e-z|curl bar/.test(v)) return 'barbell';
  if (/dumbbell|kettlebell/.test(v)) return 'dumbbell';
  if (/body ?(only|weight)|none/.test(v)) return 'bodyweight';
  return 'other';
}

export const MAPPING: Record<string, MappingRule> = {
  'lat-pulldown': {
    allowSource: ['cable', 'machine'],
    include: [/lat\s*pull\s*-?down/i, /\bpulldown\b/i],
    exclude: [/behind (the )?neck/i],
    limit: 8,
  },
  'seated-cable-row': {
    allowSource: ['cable', 'machine'],
    include: [/seated\s+(cable\s+)?row/i, /\blow row\b/i, /cable row/i],
    // "Upright row" is a standing shoulder movement despite the name.
    exclude: [/upright/i],
    limit: 8,
  },
  'chest-press-machine': {
    allowSource: ['machine'],
    include: [/chest press/i, /machine (bench |chest )?press/i, /lever (chest|bench) press/i],
    // Cable and Smith variants belong to those stations, not this machine.
    exclude: [/decline/i, /\bcable\b/i, /\bsmith\b/i],
    limit: 8,
  },
  'leg-press': {
    allowSource: ['machine'],
    include: [/leg press/i, /sled press/i],
    exclude: [/\bsmith\b/i],
    limit: 6,
  },
  'leg-extension': {
    allowSource: ['machine'],
    include: [/leg extension/i, /knee extension/i],
    limit: 5,
  },
  'seated-leg-curl': {
    allowSource: ['machine'],
    include: [/leg curl/i, /hamstring curl/i],
    exclude: [/\bball\b/i, /\bband\b/i, /stability/i],
    limit: 6,
  },
  'smith-machine': {
    allowSource: ['machine', 'barbell'],
    include: [/smith machine/i, /\bsmith\b/i],
    limit: 10,
  },
  'cable-crossover': {
    allowSource: ['cable'],
    include: [/cable (crossover|fly|flye)/i, /\bcrossover\b/i, /cable (chest|pec)/i],
    // "Crossover reverse lunge" is a bodyweight lunge that shares the word.
    exclude: [/lunge/i, /squat/i, /\bstep\b/i],
    limit: 10,
  },
  'shoulder-press-machine': {
    allowSource: ['machine'],
    include: [/shoulder press/i, /overhead press/i, /military press/i],
    exclude: [/handstand/i, /\bsmith\b/i],
    limit: 8,
  },
  treadmill: {
    allowSource: ['machine'],
    include: [/treadmill/i],
    limit: 5,
  },
  'dumbbell-rack': {
    allowSource: ['dumbbell'],
    include: [/^dumbbell/i],
    // Anything needing a bench or another station belongs to that station.
    exclude: [/incline|decline|bench|smith|cable|machine/i],
    limit: 12,
  },
  'seated-leg-press': {
    allowSource: ['machine'],
    include: [/leg press/i],
    exclude: [/\bsmith\b/i],
    limit: 6,
  },
  'flat-bench-press': {
    allowSource: ['barbell'],
    include: [/bench press/i],
    // Incline, decline, machine and Smith variants are their own stations.
    exclude: [/incline/i, /decline/i, /\bsmith\b/i, /machine/i, /dumbbell/i, /cable/i],
    limit: 8,
  },
  'plate-loaded-row': {
    allowSource: ['machine', 'barbell'],
    include: [/\brow\b/i],
    exclude: [/upright/i, /cable/i, /dumbbell/i, /\bsmith\b/i, /inverted/i],
    limit: 8,
  },
  'squat-rack': {
    allowSource: ['barbell'],
    include: [/\bsquat\b/i, /rack pull/i],
    exclude: [/\bsmith\b/i, /dumbbell/i, /machine/i, /bodyweight/i, /\bjump\b/i],
    limit: 8,
  },

  // ── Added with the 51-machine catalog ────────────────────────────────────

  'hip-abduction': {
    allowSource: ['machine'],
    include: [/abduction/i, /abductor/i, /outer thigh/i],
    limit: 5,
  },
  'hip-adduction': {
    allowSource: ['machine'],
    include: [/adduction/i, /adductor/i, /inner thigh/i],
    limit: 5,
  },
  'back-extension': {
    include: [/back extension/i, /hyperextension/i],
    exclude: [/\bball\b/i],
    limit: 6,
  },
  'glute-ham-developer': {
    include: [/glute ham/i, /nordic/i, /natural hamstring/i],
    limit: 5,
  },
  'hip-thrust-machine': {
    include: [/hip thrust/i, /glute bridge/i],
    limit: 6,
  },
  'seated-calf-raise': {
    allowSource: ['machine', 'barbell', 'dumbbell'],
    include: [/seated calf/i],
    limit: 5,
  },
  'standing-calf-raise': {
    allowSource: ['machine', 'barbell', 'dumbbell'],
    include: [/calf raise/i, /calf press/i],
    exclude: [/seated/i, /leg press/i],
    limit: 6,
  },
  'hack-squat': {
    allowSource: ['machine', 'barbell'],
    include: [/hack squat/i],
    limit: 5,
  },
  'lying-leg-curl': {
    allowSource: ['machine'],
    include: [/lying leg curl/i, /prone leg curl/i],
    limit: 5,
  },
  'glute-kickback': {
    include: [/kickback/i, /glute extension/i, /hip extension/i],
    exclude: [/tricep/i],
    limit: 5,
  },
  'assisted-pull-up': {
    include: [/assisted (chin|pull)/i, /machine assisted/i],
    limit: 5,
  },
  't-bar-row': {
    allowSource: ['machine', 'barbell'],
    include: [/t-?bar row/i, /landmine row/i],
    limit: 5,
  },
  'chest-supported-row': {
    allowSource: ['machine', 'dumbbell'],
    include: [/chest supported/i, /incline .*row/i, /seal row/i, /lever .*row/i, /prone .*row/i],
    limit: 6,
  },
  'pull-up-bar': {
    allowSource: ['bodyweight'],
    include: [/pull-?up/i, /chin-?up/i],
    exclude: [/assisted/i, /machine/i, /lat pull/i],
    limit: 8,
  },
  'iso-lateral-pulldown': {
    allowSource: ['machine', 'cable'],
    include: [/pulldown/i, /pull-?down/i],
    exclude: [/straight-?arm/i],
    limit: 6,
  },
  'incline-bench-press': {
    allowSource: ['barbell', 'dumbbell'],
    include: [/incline.*(press|bench)/i],
    exclude: [/\bsmith\b/i, /machine/i, /cable/i, /\bfly/i],
    limit: 8,
  },
  'adjustable-bench': {
    allowSource: ['dumbbell'],
    include: [/bench (press|fly)/i, /incline dumbbell/i],
    exclude: [/barbell/i, /\bsmith\b/i, /machine/i],
    limit: 8,
  },
  'rear-delt-fly': {
    include: [/rear (delt|deltoid)/i, /reverse (fly|flye)/i, /rear lateral/i],
    limit: 6,
  },
  'lateral-raise-machine': {
    allowSource: ['machine', 'cable', 'dumbbell'],
    include: [/lateral raise/i, /side lateral/i],
    exclude: [/rear/i, /front/i, /lying/i],
    limit: 5,
  },
  'dip-station': {
    allowSource: ['bodyweight'],
    include: [/\bdip\b/i, /\bdips\b/i],
    exclude: [/assisted/i, /machine/i, /bench dip/i],
    limit: 6,
  },
  'preacher-curl-bench': {
    allowSource: ['barbell', 'dumbbell'],
    include: [/preacher/i, /concentration curl/i],
    limit: 6,
  },
  'bicep-curl-machine': {
    allowSource: ['machine'],
    include: [/curl/i],
    exclude: [/leg/i, /hamstring/i, /wrist/i, /preacher/i],
    limit: 5,
  },
  'tricep-extension-machine': {
    allowSource: ['machine'],
    include: [/tricep/i],
    limit: 5,
  },
  'ab-crunch-machine': {
    allowSource: ['machine'],
    include: [/crunch/i, /\bab\b/i],
    limit: 6,
  },
  'rotary-torso': {
    allowSource: ['machine', 'cable'],
    include: [/torso/i, /twist/i, /oblique/i, /rotation/i, /wood ?chop/i],
    exclude: [/wrist/i],
    limit: 5,
  },
  'roman-chair': {
    allowSource: ['bodyweight'],
    include: [/knee raise/i, /leg raise/i, /hanging/i],
    exclude: [/lying/i, /floor/i],
    limit: 6,
  },
  'elliptical': {
    include: [/elliptical/i],
    limit: 4,
  },
  'upright-bike': {
    include: [/cycling/i, /stationary bike/i, /\bbike\b/i],
    exclude: [/recumbent/i],
    limit: 4,
  },
  'recumbent-bike': {
    include: [/recumbent/i],
    limit: 4,
  },
  'rowing-machine': {
    include: [/rowing machine/i, /\berg\b/i, /rowing, stationary/i],
    limit: 4,
  },
  'stair-climber': {
    include: [/stair/i, /step mill/i, /stepper/i],
    limit: 4,
  },
  'functional-trainer': {
    allowSource: ['cable'],
    include: [/cable/i],
    exclude: [/crossover/i, /pulldown/i, /\brow\b/i],
    limit: 10,
  },
  'kettlebell-rack': {
    allowSource: ['dumbbell'],
    include: [/kettlebell/i],
    limit: 8,
  },
  'sled-push': {
    include: [/sled/i, /prowler/i],
    limit: 4,
  },

  'pec-deck': {
    allowSource: ['machine'],
    include: [/pec deck/i, /butterfly/i, /(machine|lever) (chest )?(fly|flye)/i, /rear delt fly/i],
    limit: 6,
  },
};

export function matchesEquipment(
  exerciseName: string,
  rule: MappingRule,
  sourceEquipment: string[] = []
): boolean {
  if (rule.exclude?.some((re) => re.test(exerciseName))) return false;
  if (!rule.include.some((re) => re.test(exerciseName))) return false;

  if (rule.allowSource?.length) {
    // An untagged exercise gets the benefit of the doubt; a mis-tagged one does not.
    if (!sourceEquipment.length) return true;
    const buckets = sourceEquipment.map(normaliseSourceEquipment);
    if (!buckets.some((b) => rule.allowSource!.includes(b))) return false;
  }

  return true;
}
