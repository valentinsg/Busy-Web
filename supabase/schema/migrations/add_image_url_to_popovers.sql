-- Add image_url column to popovers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN image_url text;
  END IF;
END $$;
