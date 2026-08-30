-- Media layer.
--
-- Kept separate from `exercise` because media and exercises have different
-- lifetimes and different sources. A machine walkthrough is not an exercise —
-- it answers "what is this and how do I sit on it", which is the whole product
-- and belongs to the equipment itself.
--
-- Rows are ranked so the app can fall back: if the top source is unavailable,
-- unplayable, or its licence lapses, the next one renders. That is what keeps
-- the content-source decision reversible.

create table public.equipment_media (
  id           uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment on delete cascade,
  -- Null means the media describes the machine itself rather than one exercise.
  exercise_id  uuid references public.exercise on delete cascade,

  kind         text not null check (kind in ('walkthrough','exercise-demo','form-tip')),
  source       text not null check (source in
                 ('youtube','free-exercise-db','exercisedb','musclewiki','manual')),

  -- For sources addressed by id (a YouTube video id, an ExerciseDB exercise id).
  source_id    text,
  -- For sources that hand over a direct URL (a hosted image or mp4).
  url          text,

  title        text not null,
  attribution  text,
  duration_s   integer,
  rank         smallint not null default 100,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),

  -- Every row must be resolvable one way or the other.
  constraint media_is_addressable check (source_id is not null or url is not null)
);

create index equipment_media_lookup_idx
  on public.equipment_media (equipment_id, kind, rank)
  where is_active;

create unique index equipment_media_unique_source
  on public.equipment_media (equipment_id, source, coalesce(source_id, url));

alter table public.equipment_media enable row level security;

create policy "equipment media is public read" on public.equipment_media
  for select using (true);
