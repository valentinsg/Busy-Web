-- Archive helper functions
-- Run this in Supabase SQL Editor if not already created

-- Increment views atomically
CREATE OR REPLACE FUNCTION archive.increment_views(p_entry_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE archive.entries
  SET views = views + 1
  WHERE id = p_entry_id;
END;
$$;

-- Increment likes atomically and return new count
CREATE OR REPLACE FUNCTION archive.increment_likes(p_entry_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE archive.entries
  SET likes = likes + 1
  WHERE id = p_entry_id
  RETURNING likes INTO new_likes;

  RETURN new_likes;
END;
$$;

-- Decrement likes (for unlike functionality)
CREATE OR REPLACE FUNCTION archive.decrement_likes(p_entry_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE archive.entries
  SET likes = GREATEST(0, likes - 1)
  WHERE id = p_entry_id
  RETURNING likes INTO new_likes;

  RETURN new_likes;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION archive.increment_views(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION archive.increment_likes(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION archive.decrement_likes(UUID) TO authenticated, anon, service_role;

-- RLS Policy for public read access to archive entries
DROP POLICY IF EXISTS "Public read access" ON archive.entries;
CREATE POLICY "Public read access" ON archive.entries
  FOR SELECT
  USING (is_public = true);

-- RLS Policy for service role to manage entries
DROP POLICY IF EXISTS "Service role full access" ON archive.entries;
CREATE POLICY "Service role full access" ON archive.entries
  FOR ALL
  USING (true)
  WITH CHECK (true);
