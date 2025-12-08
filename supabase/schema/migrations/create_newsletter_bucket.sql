-- Create newsletter bucket for campaign images
INSERT INTO storage.buckets (id, name, public)
VALUES ('newsletter', 'newsletter', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for newsletter images"
ON storage.objects FOR SELECT
USING (bucket_id = 'newsletter');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload newsletter images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'newsletter'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update newsletter images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'newsletter' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete newsletter images"
ON storage.objects FOR DELETE
USING (bucket_id = 'newsletter' AND auth.role() = 'authenticated');
