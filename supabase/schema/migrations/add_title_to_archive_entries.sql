-- Add title field to archive.entries for better SEO and display
-- Run this migration in Supabase SQL Editor

-- Add the title column
ALTER TABLE archive.entries
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add comment for documentation
COMMENT ON COLUMN archive.entries.title IS 'Optional title for the entry, used for SEO and display. Falls back to microcopy if not set.';

-- Create index for title search
CREATE INDEX IF NOT EXISTS idx_entries_title ON archive.entries USING gin(to_tsvector('spanish', COALESCE(title, '')));

-- Update existing entries: use first part of microcopy as title if not set
-- This is optional - you can run it to populate existing entries
-- UPDATE archive.entries
-- SET title = CASE
--   WHEN microcopy IS NOT NULL AND LENGTH(microcopy) > 0
--   THEN SPLIT_PART(microcopy, '.', 1)
--   ELSE NULL
-- END
-- WHERE title IS NULL;
