-- Row Level Security. The publishable/anon key ships inside the app bundle and
-- is public by design, so these policies — not the key — are what protect data.

alter table public.equipment          enable row level security;
alter table public.exercise           enable row level security;
alter table public.equipment_exercise enable row level security;
alter table public.scan               enable row level security;
alter table public.workout            enable row level security;
alter table public.workout_set        enable row level security;

-- ── Catalog: readable by anyone, writable only by the service role ───────────
-- (the service role bypasses RLS entirely, so no write policy is needed)

create policy "catalog is public read" on public.equipment
  for select using (true);

create policy "exercises are public read" on public.exercise
  for select using (true);

create policy "equipment_exercise is public read" on public.equipment_exercise
  for select using (true);

-- ── User data: strictly owner-scoped ────────────────────────────────────────

create policy "own scans are readable" on public.scan
  for select using (auth.uid() = user_id);

create policy "own scans are insertable" on public.scan
  for insert with check (auth.uid() = user_id);

-- Needed for the "not quite right?" feedback flow.
create policy "own scans are updatable" on public.scan
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own workouts are readable" on public.workout
  for select using (auth.uid() = user_id);

create policy "own workouts are writable" on public.workout
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Sets inherit ownership through their parent workout.
create policy "own workout sets are readable" on public.workout_set
  for select using (
    exists (select 1 from public.workout w
            where w.id = workout_set.workout_id and w.user_id = auth.uid())
  );

create policy "own workout sets are writable" on public.workout_set
  for all using (
    exists (select 1 from public.workout w
            where w.id = workout_set.workout_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.workout w
            where w.id = workout_set.workout_id and w.user_id = auth.uid())
  );
