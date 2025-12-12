-- Create Storage Bucket for Virtual Try-On Images
-- Run this in Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'virtual-try-on',
    'virtual-try-on',
    true, -- Public bucket for generated images
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies

-- Anyone can read generated images (public)
CREATE POLICY "Public read access for virtual try-on images"
ON storage.objects FOR SELECT
USING (bucket_id = 'virtual-try-on');

-- Authenticated users can upload person images
CREATE POLICY "Authenticated users can upload person images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'virtual-try-on'
    AND (storage.foldername(name))[1] = 'person-images'
    AND auth.role() = 'authenticated'
);

-- Service role can upload generated images
CREATE POLICY "Service role can upload generated images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'virtual-try-on'
    AND (storage.foldername(name))[1] = 'generated'
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'virtual-try-on'
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Admins can manage all files
CREATE POLICY "Admins can manage all virtual try-on files"
ON storage.objects FOR ALL
USING (
    bucket_id = 'virtual-try-on'
    AND EXISTS (
        SELECT 1 FROM public.authors
        WHERE authors.id = auth.uid()
    )
);
