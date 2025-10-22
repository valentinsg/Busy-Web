-- Create storage bucket for author avatars
insert into storage.buckets (id, name, public)
values ('authors', 'authors', true)
on conflict (id) do nothing;

-- Allow public read access
drop policy if exists "Public read access for authors" on storage.objects;
create policy "Public read access for authors"
on storage.objects for select
using (bucket_id = 'authors');

-- Allow authenticated users to upload their own avatar
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
on storage.objects for insert
with check (
  bucket_id = 'authors' 
  and auth.role() = 'authenticated'
);

-- Allow users to update their own avatar
drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
on storage.objects for update
using (
  bucket_id = 'authors'
  and auth.role() = 'authenticated'
);

-- Allow users to delete their own avatar
drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
on storage.objects for delete
using (
  bucket_id = 'authors'
  and auth.role() = 'authenticated'
);
