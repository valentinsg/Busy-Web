-- Create popovers bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'popovers',
  'popovers',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to popovers bucket
CREATE POLICY IF NOT EXISTS "Public read access for popovers"
ON storage.objects FOR SELECT
USING (bucket_id = 'popovers');

-- Allow authenticated users to upload to popovers bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can upload popovers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'popovers' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can update popovers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'popovers' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can delete popovers"
ON storage.objects FOR DELETE
USING (bucket_id = 'popovers' AND auth.role() = 'authenticated');
