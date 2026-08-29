-- Starter catalog. These 12 cover most of what a newcomer meets on a
-- commercial gym floor. Expand from real `scan` data: the machines users
-- photograph that resolve to low confidence are the ones to add next.

insert into public.equipment
  (slug, display_name, aliases, category, primary_muscles, difficulty, description, how_to_setup, common_mistakes)
values
('lat-pulldown', 'Lat Pulldown', array['pulldown machine','lat machine','pull down'], 'cable',
 array['lats','biceps','upper back'], 1,
 'A seated cable machine with a wide bar overhead. You pull the bar down to your chest, training the big muscles down the sides of your back.',
 'Set the thigh pad so your legs are snug underneath — this stops you lifting off the seat. Grip the bar slightly wider than your shoulders.',
 array['Leaning too far back and turning it into a row','Pulling the bar behind your neck','Yanking with your arms instead of driving your elbows down']),

('seated-cable-row', 'Seated Cable Row', array['cable row','low row','seated row'], 'cable',
 array['mid back','lats','biceps'], 1,
 'A seated machine where you pull a handle horizontally toward your stomach. Builds thickness through the middle of your back.',
 'Feet flat on the platform with a slight knee bend. Sit tall, arms extended, chest up before you start pulling.',
 array['Rounding your back at the end of the stretch','Rocking your torso back and forth for momentum','Shrugging your shoulders up toward your ears']),

('chest-press-machine', 'Chest Press Machine', array['seated chest press','machine bench press'], 'selectorized',
 array['chest','triceps','front delts'], 1,
 'A seated pressing machine that pushes handles away from your chest. A beginner-friendly stand-in for the bench press — no spotter needed.',
 'Adjust the seat so the handles sit level with the middle of your chest, not your collarbone. Keep your back against the pad.',
 array['Setting the seat too high, which strains the shoulders','Locking the elbows hard at the top','Letting the elbows flare straight out to the sides']),

('leg-press', 'Leg Press', array['45 degree leg press','sled press','leg press machine'], 'plate-loaded',
 array['quads','glutes','hamstrings'], 1,
 'A large angled sled you push away with your feet while seated. One of the safest ways to train your legs heavy without balancing a bar.',
 'Feet shoulder-width on the middle of the platform. Release the safety handles only once your feet are set.',
 array['Letting the lower back round off the pad at the bottom','Locking the knees out hard at the top','Placing the feet too low, which strains the knees']),

('leg-extension', 'Leg Extension', array['knee extension','quad machine'], 'selectorized',
 array['quads'], 1,
 'A seated machine where you straighten your legs against a padded bar. Isolates the muscles on the front of your thigh.',
 'Line the pivot of the machine up with your knee joint, and set the ankle pad just above your shoes.',
 array['Swinging the weight up with momentum','Setting the pad too high on the shin','Going heavier than your knees are ready for']),

('seated-leg-curl', 'Seated Leg Curl', array['leg curl','hamstring curl','hamstring machine'], 'selectorized',
 array['hamstrings'], 1,
 'A seated machine where you bend your knees to pull a pad down and back. Trains the muscles at the back of your thigh.',
 'Knee joint in line with the machine pivot, thigh pad locked down snug so your legs stay put.',
 array['Lifting the hips off the seat','Using only a fraction of the available range','Snapping the weight back on the way up']),

('smith-machine', 'Smith Machine', array['smith rack','guided barbell'], 'rack',
 array['full body'], 2,
 'A barbell fixed inside vertical rails so it can only travel straight up and down. The fixed path makes it more forgiving than a free barbell.',
 'Set the safety stops just below your working range. Rotate the bar to unhook it, and check it is unhooked before your first rep.',
 array['Forgetting to set the safety catches','Standing in the wrong spot for the fixed bar path','Assuming it carries over directly to a free barbell']),

('cable-crossover', 'Cable Crossover', array['cable machine','functional trainer','dual pulley'], 'cable',
 array['chest','shoulders','full body'], 2,
 'Two adjustable pulley towers facing each other. One of the most versatile stations in the gym — dozens of exercises from one machine.',
 'Set both pulleys to the same height for the movement you want, and pick a weight light enough to control at full stretch.',
 array['Starting far too heavy for the stretched position','Standing too close, so there is no tension at the start','Using the arms alone instead of bracing the whole body']),

('shoulder-press-machine', 'Shoulder Press Machine', array['overhead press machine','military press machine'], 'selectorized',
 array['shoulders','triceps'], 1,
 'A seated machine that presses handles overhead. A controlled way to build shoulder strength without balancing weight above your head.',
 'Set the seat so the handles start at about shoulder height. Back flat against the pad, feet planted.',
 array['Arching the lower back hard to push the weight','Starting the handles too low behind the shoulders','Holding your breath through the whole set']),

('treadmill', 'Treadmill', array['running machine','cardio treadmill'], 'cardio',
 array['cardiovascular','legs'], 1,
 'A motorised belt for walking or running indoors, with adjustable speed and incline.',
 'Clip the safety key to your clothing before you start. Begin at a walk and raise the speed gradually.',
 array['Skipping the safety clip','Holding the handrails while running, which wrecks your form','Jumping straight onto a fast-moving belt']),

('dumbbell-rack', 'Dumbbell Rack', array['free weights','dumbbells','dumbbell stand'], 'free-weight',
 array['full body'], 1,
 'The rack of fixed-weight dumbbells. Endlessly versatile, and the place most beginners feel most self-conscious — everyone starts light.',
 'Pick a weight you can control for at least eight clean reps. Lift with your legs when taking heavy ones off the rack.',
 array['Ego-lifting a weight you cannot control','Dropping dumbbells on the floor','Not returning them to the right slot']),

('pec-deck', 'Pec Deck', array['chest fly machine','butterfly machine','rear delt fly'], 'selectorized',
 array['chest','front delts'], 1,
 'A seated machine that brings two arms together in front of your chest in an arc. Many models reverse to train the rear shoulders too.',
 'Seat height so the handles are level with mid-chest, with a soft bend held in the elbows throughout.',
 array['Setting the start position into an over-stretched shoulder','Bending and straightening the arms like a press','Rushing the return instead of controlling it'])

on conflict (slug) do nothing;
