-- Run in Supabase SQL Editor.
create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null check (char_length(prompt) <= 1200),
  storage_path text not null,
  style text not null default 'Anime',
  created_at timestamptz not null default now()
);

alter table public.artworks enable row level security;

create policy "Users can read their own artworks"
on public.artworks for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own artworks"
on public.artworks for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own artworks"
on public.artworks for delete to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('artworks', 'artworks', false)
on conflict (id) do nothing;

create policy "Authenticated users upload to own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'artworks'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can view their own artwork files"
on storage.objects for select to authenticated
using (
  bucket_id = 'artworks'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users delete own artwork files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'artworks'
  and (storage.foldername(name))[1] = auth.uid()::text
);
