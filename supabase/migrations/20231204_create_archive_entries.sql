-- Create archive schema if not exists
CREATE SCHEMA IF NOT EXISTS archive;

-- Create archive.entries table
CREATE TABLE IF NOT EXISTS archive.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thumb_url TEXT NOT NULL,
  medium_url TEXT NOT NULL,
  full_url TEXT NOT NULL,
  colors TEXT[],
  mood TEXT[],
  place TEXT,
  person TEXT,
  tags TEXT[],
  microcopy TEXT,
  likes INT DEFAULT 0,
  views INT DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE archive.entries ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_archive_entries_mood ON archive.entries USING GIN(mood);
CREATE INDEX IF NOT EXISTS idx_archive_entries_tags ON archive.entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_archive_entries_created_at ON archive.entries(created_at DESC);
