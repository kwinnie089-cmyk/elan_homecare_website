create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(btrim(comment)) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

revoke all on public.reviews from anon, authenticated;
grant insert (name, rating, comment) on public.reviews to anon, authenticated;
grant select (id, name, rating, comment, created_at) on public.reviews to authenticated;

drop policy if exists "Anyone can submit a review" on public.reviews;
create policy "Anyone can submit a review"
  on public.reviews
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Elan admin can view reviews" on public.reviews;
create policy "Elan admin can view reviews"
  on public.reviews
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'elanhomenursing@gmail.com');
