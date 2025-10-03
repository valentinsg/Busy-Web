-- Playlists table for Spotify playlists management
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  spotify_url TEXT NOT NULL,
  cover_image TEXT,
  genre TEXT,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published playlists
CREATE POLICY "Public playlists are viewable by everyone"
  ON public.playlists
  FOR SELECT
  USING (is_published = true);

-- Policy: Authenticated users can read all playlists (for admin)
CREATE POLICY "Authenticated users can view all playlists"
  ON public.playlists
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert playlists
CREATE POLICY "Authenticated users can insert playlists"
  ON public.playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update playlists
CREATE POLICY "Authenticated users can update playlists"
  ON public.playlists
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete playlists
CREATE POLICY "Authenticated users can delete playlists"
  ON public.playlists
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_playlists_slug ON public.playlists(slug);
CREATE INDEX IF NOT EXISTS idx_playlists_published ON public.playlists(is_published);
CREATE INDEX IF NOT EXISTS idx_playlists_order ON public.playlists(order_index);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_playlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_playlists_timestamp
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_playlists_updated_at();
