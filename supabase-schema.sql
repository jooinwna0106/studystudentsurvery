create table if not exists public.study_surveys (
  id uuid primary key,
  grade integer not null check (grade between 7 and 13),
  study_hours numeric not null check (study_hours >= 0 and study_hours <= 12),
  focus integer not null check (focus between 0 and 100),
  effort_result text not null check (effort_result in ('O', 'X')),
  satisfaction integer not null check (satisfaction between 1 and 10),
  created_at timestamptz not null default now()
);

alter table public.study_surveys enable row level security;

create policy "Allow public survey reads"
  on public.study_surveys
  for select
  using (true);

create policy "Allow public survey inserts"
  on public.study_surveys
  for insert
  with check (true);
