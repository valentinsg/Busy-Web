-- Fix the ambiguous 'id' column reference in get_recommendations RPC
-- Run this migration in Supabase SQL Editor

-- Drop the existing function first
DROP FUNCTION IF EXISTS archive.get_recommendations(UUID, INTEGER);

-- Recreate with explicit table aliases to avoid ambiguity
CREATE OR REPLACE FUNCTION archive.get_recommendations(
  p_entry_id UUID,
  p_max_results INTEGER DEFAULT 8
)
RETURNS TABLE (
  entry_id UUID,
  score NUMERIC,
  factors JSONB,
  entry JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_source_entry RECORD;
BEGIN
  -- Get the source entry details
  SELECT e.id, e.colors, e.mood, e.tags, e.place, e.person
  INTO v_source_entry
  FROM archive.entries e
  WHERE e.id = p_entry_id;

  IF v_source_entry IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH scored_entries AS (
    SELECT
      e.id AS entry_id,
      -- Calculate similarity score based on multiple factors
      (
        -- Color similarity (up to 0.3)
        COALESCE(
          (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.colors, 1), 1)
           FROM unnest(e.colors) c
           WHERE c = ANY(v_source_entry.colors)) * 0.3,
          0
        ) +
        -- Mood similarity (up to 0.25)
        COALESCE(
          (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.mood, 1), 1)
           FROM unnest(e.mood) m
           WHERE m = ANY(v_source_entry.mood)) * 0.25,
          0
        ) +
        -- Tags similarity (up to 0.25)
        COALESCE(
          (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.tags, 1), 1)
           FROM unnest(e.tags) t
           WHERE t = ANY(v_source_entry.tags)) * 0.25,
          0
        ) +
        -- Same place bonus (0.1)
        CASE WHEN e.place = v_source_entry.place AND e.place IS NOT NULL THEN 0.1 ELSE 0 END +
        -- Recency bonus (up to 0.1)
        GREATEST(0, 0.1 - (EXTRACT(EPOCH FROM (NOW() - e.created_at)) / 86400 / 365))
      ) AS score,
      e.*
    FROM archive.entries e
    WHERE e.id != p_entry_id
      AND e.is_public = true
  )
  SELECT
    se.entry_id,
    ROUND(se.score, 3) AS score,
    jsonb_build_object(
      'color', ROUND((
        COALESCE(
          (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.colors, 1), 1)
           FROM unnest(se.colors) c
           WHERE c = ANY(v_source_entry.colors)) * 0.3,
          0
        )
      ), 3),
      'mood', ROUND((
        COALESCE(
          (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.mood, 1), 1)
           FROM unnest(se.mood) m
           WHERE m = ANY(v_source_entry.mood)) * 0.25,
          0
        )
      ), 3),
      'tags', ROUND((
        COALESCE(
          (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.tags, 1), 1)
           FROM unnest(se.tags) t
           WHERE t = ANY(v_source_entry.tags)) * 0.25,
          0
        )
      ), 3),
      'place', CASE WHEN se.place = v_source_entry.place AND se.place IS NOT NULL THEN 0.1 ELSE 0 END,
      'recency', ROUND(GREATEST(0, 0.1 - (EXTRACT(EPOCH FROM (NOW() - se.created_at)) / 86400 / 365)), 3),
      'popularity', 0
    ) AS factors,
    to_jsonb(se.*) - 'score' AS entry
  FROM scored_entries se
  WHERE se.score > 0
  ORDER BY se.score DESC
  LIMIT p_max_results;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION archive.get_recommendations(UUID, INTEGER) TO authenticated, anon, service_role;
