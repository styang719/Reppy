-- Catalog expansion, 16 machines to 50.
--
-- The model classifies into a closed set built from this table, so a machine
-- that is missing does not come back as "unknown" — it comes back as whichever
-- of the existing entries looks nearest. A 16-row catalog therefore produces
-- confident wrong answers on a real gym floor, which is exactly what testing
-- found.
--
-- 50 covers the large majority of a commercial gym. Expand further from the
-- `scan` table: rows with a null equipment_id are machines users photographed
-- that this catalog cannot name.

insert into public.equipment
  (slug, display_name, aliases, category, primary_muscles, difficulty, description, how_to_setup, common_mistakes)
values

-- ── Legs and glutes ──────────────────────────────────────────────────────────

('hip-abduction', 'Hip Abduction Machine',
 array['outer thigh machine','abductor machine','hip abductor'], 'selectorized',
 array['glutes','outer hip'], 1,
 'A seated machine with pads on the outside of your knees that you push apart. Trains the muscles on the outside of the hip, which stabilise you every time you walk or run.',
 'Sit fully back in the seat. The pads sit against the outside of your knees, not your shins. Start with the legs together.',
 array['Leaning forward to force the weight out','Letting the pads snap back together','Going heavier than you can control on the way in']),

('hip-adduction', 'Hip Adduction Machine',
 array['inner thigh machine','adductor machine','hip adductor'], 'selectorized',
 array['inner thigh','groin'], 1,
 'The mirror image of the abduction machine: pads sit on the inside of your knees and you squeeze them together. Trains the inner thigh.',
 'Set the starting width so you feel a gentle stretch, not a strain. Many machines have a lever to adjust how far apart the legs begin.',
 array['Starting far too wide, which strains the groin','Bouncing out of the stretched position','Using momentum rather than squeezing']),

('back-extension', 'Back Extension Bench',
 array['hyperextension bench','45 degree back extension','roman chair back extension'], 'rack',
 array['lower back','glutes','hamstrings'], 2,
 'An angled pad you lie face-down on with your ankles hooked under rollers, bending and straightening at the hips. Builds the muscles along the spine and the glutes.',
 'Set the hip pad just below your hip bones so you can bend freely. Ankles snug under the rollers before you lean forward.',
 array['Setting the pad too high, which stops the hips bending','Arching hard at the top rather than stopping in line','Adding weight before the movement is controlled']),

('glute-ham-developer', 'Glute-Ham Developer',
 array['GHD','glute ham raise','ghd machine'], 'rack',
 array['hamstrings','glutes','lower back'], 3,
 'A frame where your feet are locked between rollers against a footplate and you lower and raise your whole torso. Demanding — the hamstrings hold your bodyweight.',
 'Knees just behind the pad, feet flat against the plate. Start with your hands on the floor for support until the movement is familiar.',
 array['Attempting full raises before building up','Setting the knee pad too far forward','Rounding the lower back to cheat the range']),

('hip-thrust-machine', 'Hip Thrust Machine',
 array['glute drive','glute bridge machine','hip thrust'], 'plate-loaded',
 array['glutes','hamstrings'], 1,
 'A seat with a padded bar across your hips that you drive upward by squeezing your glutes. A far more comfortable way to load hip thrusts than balancing a barbell.',
 'Back against the pad with the padded bar across your hip crease, not your stomach. Feet flat, shins roughly vertical at the top.',
 array['Placing the pad on the belly rather than the hips','Arching the lower back instead of squeezing the glutes','Pushing through the toes rather than the heels']),

('seated-calf-raise', 'Seated Calf Raise',
 array['calf raise machine','seated calf machine'], 'plate-loaded',
 array['calves'], 1,
 'A seat with a pad over your knees and a platform for the balls of your feet. Raising your heels trains the lower calf specifically.',
 'Balls of the feet on the edge of the platform, heels free to drop below. Pad snug across the lower thigh, just above the knee.',
 array['Standing the pad on the knee cap itself','Using only a fraction of the range','Bouncing rather than pausing at the top']),

('standing-calf-raise', 'Standing Calf Raise',
 array['calf raise','standing calf machine'], 'selectorized',
 array['calves'], 1,
 'A standing machine with shoulder pads and a raised platform. Rising onto your toes trains the larger upper calf muscle.',
 'Set the shoulder pads so you stand tall with a slight knee bend. Balls of the feet on the platform, heels hanging free.',
 array['Bending the knees to help the lift','Rushing the descent, which is the useful half','Setting the pads so low you are stooped']),

('hack-squat', 'Hack Squat Machine',
 array['hack squat','sled hack squat'], 'plate-loaded',
 array['quads','glutes'], 2,
 'An angled sled with shoulder pads that you squat under. The frame takes care of balance, so you can load the legs heavily without a bar on your back.',
 'Shoulders under the pads, feet shoulder-width on the platform. Release the safety handles only once you are braced.',
 array['Letting the knees collapse inward','Coming out of the bottom with a bounce','Forgetting to re-engage the safeties at the end']),

('lying-leg-curl', 'Lying Leg Curl',
 array['prone leg curl','lying hamstring curl'], 'selectorized',
 array['hamstrings'], 1,
 'A bench you lie face-down on, curling a padded roller up toward your backside. Trains the hamstrings through a different angle to the seated version.',
 'Line your knees up with the machine pivot at the edge of the pad. Roller sits just above the heels.',
 array['Lifting the hips off the bench','Curling only halfway','Letting the weight drop on the way back down']),

('glute-kickback', 'Glute Kickback Machine',
 array['kickback machine','glute machine','hip extension machine'], 'selectorized',
 array['glutes'], 1,
 'A standing machine where you press one leg back against a pad. Isolates the glute on one side at a time.',
 'Chest against the pad, hands on the handles. Set the foot pad so your working leg starts with the knee bent under you.',
 array['Arching the lower back to gain range','Rushing rather than squeezing at the end','Setting the pad too high to reach comfortably']),

-- ── Back ─────────────────────────────────────────────────────────────────────

('assisted-pull-up', 'Assisted Pull-Up Machine',
 array['chin dip assist','assisted chin up','gravitron'], 'selectorized',
 array['lats','biceps','chest','triceps'], 1,
 'A frame with overhead pull-up handles and a counterweighted pad for your knees or feet. The weight you select *helps* you — more weight means an easier rep, which is the opposite of every other machine.',
 'Select a high assistance to start. Step onto the platforms, take the handles, then kneel or stand on the pad.',
 array['Assuming more weight means harder, as elsewhere','Dropping onto the pad rather than stepping down','Swinging instead of pulling under control']),

('t-bar-row', 'T-Bar Row',
 array['landmine row','chest supported t-bar'], 'plate-loaded',
 array['mid back','lats','biceps'], 2,
 'A bar anchored at one end with plates on the other, pulled toward your chest. Many gyms have a chest-supported version with a pad.',
 'Stand over the bar with knees soft. On a chest-supported model, set the pad so your arms hang fully extended.',
 array['Rounding the lower back under load','Standing up as you pull','Loading more than you can pull without jerking']),

('chest-supported-row', 'Chest-Supported Row',
 array['incline row machine','seal row','prone row'], 'plate-loaded',
 array['mid back','lats','rear delts'], 1,
 'A rowing machine with a chest pad, so your torso cannot swing. That makes it one of the safest ways for a beginner to learn a row.',
 'Set the chest pad so your arms reach the handles fully extended. Feet planted for stability.',
 array['Letting the chest come away from the pad','Pulling with the arms rather than the elbows','Shrugging at the top']),

('pull-up-bar', 'Pull-Up Bar',
 array['chin up bar','pullup station'], 'rack',
 array['lats','biceps','core'], 3,
 'A fixed overhead bar. One of the hardest bodyweight exercises — most beginners start on the assisted machine or with a resistance band.',
 'Grip slightly wider than shoulder-width. Hang with the shoulders pulled down rather than loose before pulling.',
 array['Kicking the legs to generate momentum','Stopping halfway rather than clearing the chin','Dropping from the top instead of lowering']),

('iso-lateral-pulldown', 'Iso-Lateral Pulldown',
 array['hammer strength pulldown','plate loaded pulldown','independent pulldown'], 'plate-loaded',
 array['lats','biceps'], 2,
 'A plate-loaded pulldown where each arm moves independently, so your stronger side cannot take over for the weaker one.',
 'Load both sides evenly. Set the seat and thigh pad so your arms extend fully overhead without lifting off.',
 array['Loading one side heavier than the other','Leaning back to turn it into a row','Letting the weight pull the arms up too fast']),

-- ── Chest and shoulders ──────────────────────────────────────────────────────

('incline-bench-press', 'Incline Bench Press',
 array['incline barbell bench','incline press'], 'rack',
 array['upper chest','front delts','triceps'], 3,
 'A bench set at roughly 30-45 degrees under a barbell. Shifts the work toward the upper chest and shoulders.',
 'Set the safety bars just below your chest level. Eyes under the bar, grip slightly wider than shoulders.',
 array['Setting the incline too steep, which turns it into a shoulder press','Lifting without safeties or a spotter','Bouncing the bar off the chest']),

('adjustable-bench', 'Adjustable Bench',
 array['flat bench','incline bench','utility bench'], 'free-weight',
 array['full body'], 1,
 'A bench whose back pad tilts from flat to upright. Paired with dumbbells it covers a large share of everything you might want to do.',
 'Set the angle before you pick up the weights. Check the pin is fully seated — a pad that drops mid-set is how people get hurt.',
 array['Leaving the pad on a half-engaged pin','Choosing weights before setting the angle','Leaving it on incline for the next person']),

('rear-delt-fly', 'Rear Delt Fly Machine',
 array['reverse pec deck','rear delt machine','reverse fly'], 'selectorized',
 array['rear delts','upper back'], 1,
 'A machine you sit facing into, pulling the arms out and back in an arc. Trains the back of the shoulders — usually the weakest part for someone who sits at a desk.',
 'Chest against the pad, arms roughly at shoulder height with a soft bend held in the elbows.',
 array['Bending and straightening the arms like a row','Using enough weight to need momentum','Shrugging the shoulders up toward the ears']),

('lateral-raise-machine', 'Lateral Raise Machine',
 array['side raise machine','shoulder lateral machine'], 'selectorized',
 array['side delts'], 1,
 'A seated machine where pads sit against your upper arms and you raise them outward. Builds the width of the shoulders.',
 'Set the seat so the pivot lines up with your shoulder joint. Pads against the upper arm, not the forearm.',
 array['Raising far above shoulder height','Setting the seat too low, which strains the joint','Going heavy — this one needs control, not load']),

('dip-station', 'Dip Station',
 array['parallel bars','dip bars','triceps dip'], 'rack',
 array['chest','triceps','front delts'], 3,
 'Two parallel bars you support yourself between and lower down from. Hard for a beginner — the assisted machine version is the place to start.',
 'Grip the bars, press up to straight arms, then lower under control. Lean forward slightly for more chest, stay upright for more triceps.',
 array['Dropping too deep before the shoulders are ready','Letting the shoulders roll forward at the bottom','Attempting full dips before assisted ones are easy']),

-- ── Arms ─────────────────────────────────────────────────────────────────────

('preacher-curl-bench', 'Preacher Curl Bench',
 array['preacher bench','scott bench','arm curl bench'], 'free-weight',
 array['biceps'], 1,
 'An angled pad you rest the backs of your arms against while curling. The pad stops you swinging, so the biceps do the work.',
 'Set the seat so your armpits rest at the top of the pad. Feet flat on the floor.',
 array['Letting the arms straighten too suddenly at the bottom','Lifting the elbows off the pad','Loading enough that the shoulders join in']),

('bicep-curl-machine', 'Bicep Curl Machine',
 array['arm curl machine','seated curl machine'], 'selectorized',
 array['biceps'], 1,
 'A seated machine with an arm pad and handles. A guided version of the preacher curl with no bar to balance.',
 'Seat height so your upper arms lie flat on the pad and your shoulders are relaxed down.',
 array['Rocking backwards to start the lift','Only going halfway up','Releasing quickly rather than lowering']),

('tricep-extension-machine', 'Triceps Extension Machine',
 array['tricep machine','seated tricep extension','triceps press'], 'selectorized',
 array['triceps'], 1,
 'A seated machine that presses handles down or forward against a pad. Isolates the back of the upper arm.',
 'Set the seat so your elbows sit at the pivot point and stay tucked in against your sides.',
 array['Letting the elbows drift outward','Leaning into the movement with the upper body','Locking out hard at the end of each rep']),

-- ── Core ─────────────────────────────────────────────────────────────────────

('ab-crunch-machine', 'Ab Crunch Machine',
 array['abdominal machine','crunch machine','ab machine'], 'selectorized',
 array['abs'], 1,
 'A seated machine you curl forward in against a chest pad or handles. Trains the abs with resistance you can actually adjust.',
 'Set the seat so the pivot lines up with your waist. Grip the handles lightly — the work should be in the middle, not the arms.',
 array['Pulling with the arms instead of curling the torso','Using so much weight the hips lift','Rushing rather than pausing at the shortest point']),

('rotary-torso', 'Rotary Torso Machine',
 array['torso rotation','oblique machine','twist machine'], 'selectorized',
 array['obliques','core'], 2,
 'A seated machine where your legs stay fixed and your upper body rotates against resistance. Trains the muscles at the sides of the waist.',
 'Lock the legs in place. Start with a light weight and a small range until the rotation feels comfortable.',
 array['Setting a big range before the spine is warm','Yanking into the rotation','Going heavy — this one rewards control']),

('roman-chair', 'Roman Chair',
 array['captains chair','vertical knee raise','VKR'], 'rack',
 array['abs','hip flexors'], 2,
 'A padded frame you support yourself in on your forearms, raising your knees or legs. A staple for the lower abs.',
 'Forearms on the pads, back against the rest, shoulders pressed down away from the ears.',
 array['Swinging the legs rather than lifting','Letting the lower back arch away from the pad','Going for straight legs before knee raises are easy']),

-- ── Cardio ───────────────────────────────────────────────────────────────────

('elliptical', 'Elliptical Trainer',
 array['cross trainer','elliptical machine'], 'cardio',
 array['cardiovascular','legs','arms'], 1,
 'A machine with foot pedals on a smooth oval path and moving handles. Low impact — easier on the knees than running.',
 'Step on with the pedals level. Start slow to find the rhythm before adding resistance.',
 array['Gripping the fixed rails and ignoring the moving handles','Leaning heavily on the frame','Setting resistance so high the motion goes choppy']),

('upright-bike', 'Upright Exercise Bike',
 array['stationary bike','exercise bike','upright cycle'], 'cardio',
 array['cardiovascular','legs'], 1,
 'A stationary bike ridden in an upright position, much like a normal bicycle.',
 'Set the saddle so your leg is almost straight at the bottom of the pedal stroke, with a slight bend remaining.',
 array['Saddle too low, which is hard on the knees','Rocking the hips side to side','Gripping the bars tightly and tensing the shoulders']),

('recumbent-bike', 'Recumbent Bike',
 array['reclining bike','seated bike'], 'cardio',
 array['cardiovascular','legs'], 1,
 'A bike with a proper seat and back rest, pedals out in front. Comfortable, supportive, and kind to the lower back.',
 'Slide the seat so your legs are nearly straight at full extension without your hips rocking.',
 array['Seat too far back, which over-extends the knees','Slumping rather than using the back rest','Pedalling with no resistance at all']),

('rowing-machine', 'Rowing Machine',
 array['rower','erg','concept 2'], 'cardio',
 array['cardiovascular','back','legs'], 2,
 'A machine that mimics rowing a boat. One of the few cardio machines that works most of the body at once.',
 'Strap the feet so the strap crosses the widest part. The order is legs, then back, then arms — and the reverse coming back.',
 array['Pulling with the arms first','Rounding the back at the catch','Rushing back up the slide']),

('stair-climber', 'Stair Climber',
 array['stairmaster','step mill','stepper'], 'cardio',
 array['cardiovascular','glutes','legs'], 2,
 'A machine of revolving steps you climb continuously. Harder than it looks — start slower than you expect to.',
 'Start at a low speed and find your footing before raising it. Step fully onto each stair rather than tip-toeing.',
 array['Leaning on the handrails, which removes most of the work','Starting at a speed you cannot sustain','Taking short bouncing steps']),

-- ── Free weights and stations ────────────────────────────────────────────────

('functional-trainer', 'Functional Trainer',
 array['dual adjustable pulley','cable station','cable tower'], 'cable',
 array['full body'], 2,
 'Two independently adjustable cable columns. Enormously versatile — most gym exercises have a cable version on this frame.',
 'Set both pulleys to the height the movement needs. Pick a weight you can control through the whole range, including the stretch.',
 array['Starting heavier than the stretched position allows','Standing too close, so there is no tension at the start','Letting the stack slam back down']),

('kettlebell-rack', 'Kettlebell Rack',
 array['kettlebells','kettlebell stand'], 'free-weight',
 array['full body'], 2,
 'The rack of cast-iron kettlebells. The offset handle makes them good for swings and carries, and less forgiving than a dumbbell.',
 'Start lighter than you would with a dumbbell — the weight sits further from your hand and feels heavier.',
 array['Swinging before learning the hip hinge','Gripping so tight the forearms fatigue first','Returning them to the wrong slot']),

('weight-plate-tree', 'Weight Plate Tree',
 array['plate rack','plate tree','weight plates'], 'free-weight',
 array['n/a'], 1,
 'The upright stand holding weight plates for the plate-loaded machines and barbells.',
 'Take plates from the top pegs first, and load a bar evenly on both sides before you lift it.',
 array['Leaving plates loaded on a machine when you finish','Lifting heavy plates with a rounded back','Stacking them on the floor rather than the tree']),

('sled-push', 'Push Sled',
 array['prowler','weight sled','sled'], 'free-weight',
 array['legs','glutes','cardiovascular'], 2,
 'A weighted frame you push across the floor. Brutally simple conditioning with no eccentric phase, so it leaves you less sore than it feels.',
 'Start with the sled empty. Arms straight, body at an angle, and drive with the legs.',
 array['Loading it heavily on a first attempt','Bending the arms and losing the line','Holding your breath through the push'])

on conflict (slug) do nothing;
