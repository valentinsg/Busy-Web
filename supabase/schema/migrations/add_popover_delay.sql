-- Add delay_seconds field to popovers table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'delay_seconds'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN delay_seconds integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.popovers.delay_seconds IS 'Seconds to wait before showing the popover (0 = immediate)';
