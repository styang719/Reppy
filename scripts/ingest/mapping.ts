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
