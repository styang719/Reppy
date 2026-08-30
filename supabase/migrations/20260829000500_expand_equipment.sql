-- Gaps found by running real gym photos against the seed catalog.
--
-- Two of four test photos matched nothing: a flat bench press (one of the most
-- recognisable things in any gym) and a plate-loaded row. A third was a seated
-- leg press, while the catalog only described the 45° sled — a different
-- machine with different setup instructions.

-- The original entry described the 45° sled specifically, so name it that way.
update public.equipment
set display_name = 'Leg Press (45° Sled)',
    aliases = array['45 degree leg press','sled press','angled leg press']
where slug = 'leg-press';

insert into public.equipment
  (slug, display_name, aliases, category, primary_muscles, difficulty, description, how_to_setup, common_mistakes)
values
('seated-leg-press', 'Seated Leg Press',
 array['horizontal leg press','cybex leg press','seated leg press machine'], 'selectorized',
 array['quads','glutes','hamstrings'], 1,
 'A seated machine where you push a footplate away horizontally against a weight stack. Easier to get in and out of than the angled sled, and the seat back keeps you supported.',
 'Adjust the seat so your knees are bent around 90 degrees at the start — any deeper and your lower back will round. Feet shoulder-width on the plate.',
 array['Setting the seat so close that the knees over-flex','Pushing through the toes instead of the whole foot','Locking the knees hard at full extension']),

('flat-bench-press', 'Flat Bench Press',
 array['bench press','olympic bench','barbell bench','flat bench'], 'rack',
 array['chest','triceps','front delts'], 3,
 'A flat bench under a barbell rack. The classic chest exercise — and the one most worth learning carefully, because the bar sits over your chest with no machine catching it.',
 'Set the safety bars just below your chest level. Lie down so your eyes are under the bar. Grip slightly wider than shoulder-width. Ask for a spotter if you are going heavy.',
 array['Lifting without safety bars or a spotter','Bouncing the bar off the chest','Flaring the elbows straight out to 90 degrees','Lifting the hips off the bench']),

('plate-loaded-row', 'Plate-Loaded Row',
 array['iso-lateral row','hammer strength row','plate loaded row','chest supported row'], 'plate-loaded',
 array['mid back','lats','biceps'], 2,
 'A rowing machine you load with weight plates rather than a pin and stack. Each arm usually moves independently, so your stronger side cannot take over.',
 'Load plates evenly on both sides. Set the chest pad so you can reach the handles with your arms fully extended without straining forward.',
 array['Loading one side heavier than the other','Pulling with the arms rather than driving the elbows back','Letting the chest come away from the pad']),

('squat-rack', 'Squat Rack',
 array['power rack','squat cage','power cage','half rack'], 'rack',
 array['quads','glutes','full body'], 3,
 'A tall steel frame that holds a barbell at adjustable heights, with safety bars either side. Used for squats, overhead presses and rack pulls.',
 'Set the bar hooks at about upper-chest height and the safety bars just below the lowest point you will reach. Always test the safety height with an empty bar first.',
 array['Setting the safety bars too low, or not at all','Racking the bar by feel instead of looking','Setting the hooks so high you have to tiptoe to unrack'])

on conflict (slug) do nothing;
