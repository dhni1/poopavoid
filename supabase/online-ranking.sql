create table if not exists public.rankings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 20),
  score integer not null default 0 check (score >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists rankings_score_idx
on public.rankings (score desc, updated_at asc);

alter table public.rankings enable row level security;

drop policy if exists "Anyone can read rankings" on public.rankings;
create policy "Anyone can read rankings"
on public.rankings
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can insert their own ranking" on public.rankings;
create policy "Authenticated users can insert their own ranking"
on public.rankings
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
);

drop policy if exists "Authenticated users can update their own ranking" on public.rankings;
create policy "Authenticated users can update their own ranking"
on public.rankings
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = user_id
);

create or replace function public.set_rankings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists rankings_set_updated_at on public.rankings;
create trigger rankings_set_updated_at
before update on public.rankings
for each row
execute function public.set_rankings_updated_at();
