-- Broaden the alias vocabulary.
--
-- A Hoist pec fly was misidentified despite having "PEC FLY" printed on its
-- placard, because that exact phrase was not among pec-deck's aliases. Aliases
-- are how one functional slug absorbs the naming and brand variation of the
-- machines that implement it, so thin alias lists cost accuracy directly.
--
-- Splitting slugs finer is the wrong answer: two near-identical options leading
-- to identical content make the classification harder, not easier. Slugs stay at
-- the level where the answer differs; aliases carry everything else.

update public.equipment set aliases = array[
  'pec fly','chest fly machine','butterfly machine','pec dec','chest fly',
  'seated chest fly','fly machine','roc-it pec fly'
] where slug = 'pec-deck';

update public.equipment set aliases = array[
  'seated chest press','machine bench press','chest press','seated press',
  'leverage chest press','converging chest press'
] where slug = 'chest-press-machine';

update public.equipment set aliases = array[
  'pulldown machine','lat machine','pull down','lat pull down','wide grip pulldown',
  'cable pulldown','lat pull'
] where slug = 'lat-pulldown';

update public.equipment set aliases = array[
  'cable row','low row','seated row','row machine','cable seated row','long pull'
] where slug = 'seated-cable-row';

update public.equipment set aliases = array[
  'knee extension','quad machine','leg ext','quad extension','seated leg extension'
] where slug = 'leg-extension';

update public.equipment set aliases = array[
  'smith rack','guided barbell','smith press','smith','guided squat rack'
] where slug = 'smith-machine';

update public.equipment set aliases = array[
  'overhead press machine','military press machine','seated shoulder press',
  'shoulder press','delt press','overhead press'
] where slug = 'shoulder-press-machine';

update public.equipment set aliases = array[
  'running machine','cardio treadmill','running belt','treadmill runner'
] where slug = 'treadmill';

update public.equipment set aliases = array[
  'calf raise machine','seated calf machine','seated calf','calf press seated'
] where slug = 'seated-calf-raise';

update public.equipment set aliases = array[
  'calf raise','standing calf machine','standing calf','calf raise standing'
] where slug = 'standing-calf-raise';

update public.equipment set aliases = array[
  'hack squat','sled hack squat','hack machine','angled squat machine','v squat'
] where slug = 'hack-squat';

update public.equipment set aliases = array[
  'prone leg curl','lying hamstring curl','leg curl lying','hamstring curl prone'
] where slug = 'lying-leg-curl';

update public.equipment set aliases = array[
  'landmine row','chest supported t-bar','t bar row','tbar row','plate loaded row bar'
] where slug = 't-bar-row';

update public.equipment set aliases = array[
  'chin up bar','pullup station','chin bar','pull up station','fixed bar'
] where slug = 'pull-up-bar';

update public.equipment set aliases = array[
  'incline barbell bench','incline press','incline bench','angled bench press'
] where slug = 'incline-bench-press';

update public.equipment set aliases = array[
  'outer thigh machine','abductor machine','hip abductor','abduction machine',
  'outer thigh','glute abductor','hip abduction adduction'
] where slug = 'hip-abduction';

update public.equipment set aliases = array[
  'inner thigh machine','adductor machine','hip adductor','adduction machine',
  'inner thigh','groin machine'
] where slug = 'hip-adduction';

update public.equipment set aliases = array[
  'hyperextension bench','45 degree back extension','roman chair back extension',
  'back extension','hyper bench','hyperextension','glute ham bench'
] where slug = 'back-extension';

update public.equipment set aliases = array[
  'glute drive','glute bridge machine','hip thrust','thrust machine',
  'glute thrust','hip bridge machine'
] where slug = 'hip-thrust-machine';

update public.equipment set aliases = array[
  'chin dip assist','assisted chin up','gravitron','assisted dip',
  'chin assist','dip assist','counterweighted pull up'
] where slug = 'assisted-pull-up';

update public.equipment set aliases = array[
  'GHD','glute ham raise','ghd machine','glute ham bench','nordic bench'
] where slug = 'glute-ham-developer';

update public.equipment set aliases = array[
  'reverse pec deck','rear delt machine','reverse fly','rear fly',
  'reverse fly machine','rear deltoid machine'
] where slug = 'rear-delt-fly';

update public.equipment set aliases = array[
  'dual adjustable pulley','cable station','cable tower','functional trainer',
  'cable machine','adjustable cable','dual pulley'
] where slug = 'functional-trainer';

update public.equipment set aliases = array[
  'cable machine','crossover','cable fly station','crossover machine',
  'dual cable crossover','cable cross'
] where slug = 'cable-crossover';

update public.equipment set aliases = array[
  '45 degree leg press','sled press','angled leg press','leg press sled',
  'incline leg press'
] where slug = 'leg-press';

update public.equipment set aliases = array[
  'horizontal leg press','seated leg press machine','cybex leg press',
  'seated press legs','selectorized leg press'
] where slug = 'seated-leg-press';

update public.equipment set aliases = array[
  'leg curl','hamstring curl','seated hamstring curl','curl machine legs'
] where slug = 'seated-leg-curl';

update public.equipment set aliases = array[
  'iso-lateral row','hammer strength row','plate loaded row','chest supported row',
  'high row','low row plate loaded'
] where slug = 'plate-loaded-row';

update public.equipment set aliases = array[
  'bench press','olympic bench','barbell bench','flat bench','bench press station'
] where slug = 'flat-bench-press';

update public.equipment set aliases = array[
  'power rack','squat cage','power cage','half rack','squat stand','rack'
] where slug = 'squat-rack';

update public.equipment set aliases = array[
  'free weights','dumbbells','dumbbell stand','dumbbell shelf','weight rack'
] where slug = 'dumbbell-rack';

update public.equipment set aliases = array[
  'abdominal machine','crunch machine','ab machine','seated crunch','ab curl machine'
] where slug = 'ab-crunch-machine';

update public.equipment set aliases = array[
  'captains chair','vertical knee raise','VKR','knee raise station','power tower'
] where slug = 'roman-chair';

update public.equipment set aliases = array[
  'cross trainer','elliptical machine','elliptical trainer','x trainer'
] where slug = 'elliptical';

update public.equipment set aliases = array[
  'rower','erg','concept 2','rowing erg','indoor rower'
] where slug = 'rowing-machine';

update public.equipment set aliases = array[
  'stairmaster','step mill','stepper','stair machine','stepmill'
] where slug = 'stair-climber';

update public.equipment set aliases = array[
  'preacher bench','scott bench','arm curl bench','preacher curl','arm blaster bench'
] where slug = 'preacher-curl-bench';

update public.equipment set aliases = array[
  'arm curl machine','seated curl machine','curl machine','biceps machine'
] where slug = 'bicep-curl-machine';

update public.equipment set aliases = array[
  'tricep machine','seated tricep extension','triceps press','tricep press machine',
  'triceps extension'
] where slug = 'tricep-extension-machine';

update public.equipment set aliases = array[
  'side raise machine','shoulder lateral machine','lateral raise','side delt machine'
] where slug = 'lateral-raise-machine';

update public.equipment set aliases = array[
  'parallel bars','dip bars','triceps dip','dip station','dip rack'
] where slug = 'dip-station';

update public.equipment set aliases = array[
  'stationary bike','exercise bike','upright cycle','spin bike','exercise cycle'
] where slug = 'upright-bike';

update public.equipment set aliases = array[
  'reclining bike','seated bike','recumbent cycle','laid back bike'
] where slug = 'recumbent-bike';

update public.equipment set aliases = array[
  'hammer strength pulldown','plate loaded pulldown','independent pulldown',
  'iso lateral pulldown','iso row pulldown'
] where slug = 'iso-lateral-pulldown';

update public.equipment set aliases = array[
  'incline row machine','seal row','prone row','chest supported machine row'
] where slug = 'chest-supported-row';

update public.equipment set aliases = array[
  'kickback machine','glute machine','hip extension machine','glute press',
  'standing glute machine'
] where slug = 'glute-kickback';

update public.equipment set aliases = array[
  'torso rotation','oblique machine','twist machine','rotary torso','ab twist machine'
] where slug = 'rotary-torso';

update public.equipment set aliases = array[
  'flat bench','incline bench','utility bench','adjustable weight bench','fid bench'
] where slug = 'adjustable-bench';
