-- Create storage bucket for Blacktop team and player images
insert into storage.buckets (id, name, public)
values ('blacktop', 'blacktop', true)
on conflict (id) do nothing;

-- Allow public read access
drop policy if exists "Public read access for blacktop" on storage.objects;
create policy "Public read access for blacktop"
on storage.objects for select
using (bucket_id = 'blacktop');

-- Allow anyone to upload images (for team registration)
drop policy if exists "Anyone can upload blacktop images" on storage.objects;
create policy "Anyone can upload blacktop images"
on storage.objects for insert
with check (
  bucket_id = 'blacktop'
  and (storage.foldername(name))[1] in ('teams', 'players')
);

-- Allow authenticated users to update blacktop images
drop policy if exists "Authenticated users can update blacktop images" on storage.objects;
create policy "Authenticated users can update blacktop images"
on storage.objects for update
using (
  bucket_id = 'blacktop'
  and auth.role() = 'authenticated'
);

-- Allow authenticated users to delete blacktop images
drop policy if exists "Authenticated users can delete blacktop images" on storage.objects;
create policy "Authenticated users can delete blacktop images"
on storage.objects for delete
using (
  bucket_id = 'blacktop'
  and auth.role() = 'authenticated'
);
