-- Artist submissions table for artists who want to be featured in playlists
CREATE TABLE IF NOT EXISTS public.artist_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  spotify_artist_url TEXT,
  track_url TEXT NOT NULL,
  genre TEXT,
  social_instagram TEXT,
  social_youtube TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artist_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit (insert)
CREATE POLICY "Anyone can submit artist proposals"
  ON public.artist_submissions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can view all submissions
CREATE POLICY "Authenticated users can view all submissions"
  ON public.artist_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update submissions
CREATE POLICY "Authenticated users can update submissions"
  ON public.artist_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete submissions
CREATE POLICY "Authenticated users can delete submissions"
  ON public.artist_submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artist_submissions_status ON public.artist_submissions(status);
CREATE INDEX IF NOT EXISTS idx_artist_submissions_created ON public.artist_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artist_submissions_email ON public.artist_submissions(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_artist_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_artist_submissions_timestamp
  BEFORE UPDATE ON public.artist_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_submissions_updated_at();
