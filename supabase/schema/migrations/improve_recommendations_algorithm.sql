-- Improved recommendation algorithm with better scoring factors
-- Run this migration in Supabase SQL Editor

-- Drop the existing function first
DROP FUNCTION IF EXISTS archive.get_recommendations(UUID, INTEGER);

-- Recreate with improved scoring algorithm
CREATE OR REPLACE FUNCTION archive.get_recommendations(
  p_entry_id UUID,
  p_max_results INTEGER DEFAULT 24
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
  SELECT e.id, e.colors, e.mood, e.tags, e.place, e.person, e.created_at
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
      -- Calculate similarity score based on multiple factors (total up to 1.0)
      (
        -- Color similarity (up to 0.25) - compare dominant colors
        COALESCE(
          CASE
            WHEN array_length(v_source_entry.colors, 1) > 0 AND array_length(e.colors, 1) > 0 THEN
              (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.colors, 1), array_length(e.colors, 1))
               FROM unnest(e.colors) c
               WHERE c = ANY(v_source_entry.colors)) * 0.25
            ELSE 0
          END,
          0
        ) +
        -- Mood similarity (up to 0.20) - emotional/vibe match
        COALESCE(
          CASE
            WHEN array_length(v_source_entry.mood, 1) > 0 AND array_length(e.mood, 1) > 0 THEN
              (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.mood, 1), array_length(e.mood, 1))
               FROM unnest(e.mood) m
               WHERE m = ANY(v_source_entry.mood)) * 0.20
            ELSE 0
          END,
          0
        ) +
        -- Tags similarity (up to 0.25) - content/category match
        COALESCE(
          CASE
            WHEN array_length(v_source_entry.tags, 1) > 0 AND array_length(e.tags, 1) > 0 THEN
              (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.tags, 1), array_length(e.tags, 1))
               FROM unnest(e.tags) t
               WHERE t = ANY(v_source_entry.tags)) * 0.25
            ELSE 0
          END,
          0
        ) +
        -- Same place bonus (0.15) - location relevance
        CASE WHEN e.place = v_source_entry.place AND e.place IS NOT NULL AND e.place != '' THEN 0.15 ELSE 0 END +
        -- Same person bonus (0.10) - person relevance
        CASE WHEN e.person = v_source_entry.person AND e.person IS NOT NULL AND e.person != '' THEN 0.10 ELSE 0 END +
        -- Temporal proximity bonus (up to 0.05) - photos from similar time period
        GREATEST(0, 0.05 * (1 - ABS(EXTRACT(EPOCH FROM (e.created_at - v_source_entry.created_at)) / (86400 * 30)))) +
        -- Popularity bonus (up to 0.05) - engagement signal
        LEAST(0.05, COALESCE(e.likes, 0) * 0.005)
      ) AS score,
      e.*
    FROM archive.entries e
    WHERE e.id != p_entry_id
      AND e.is_public = true
  )
  SELECT
    se.entry_id,
    ROUND(se.score, 4) AS score,
    jsonb_build_object(
      'color', ROUND((
        COALESCE(
          CASE
            WHEN array_length(v_source_entry.colors, 1) > 0 AND array_length(se.colors, 1) > 0 THEN
              (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.colors, 1), array_length(se.colors, 1))
               FROM unnest(se.colors) c
               WHERE c = ANY(v_source_entry.colors)) * 0.25
            ELSE 0
          END,
          0
        )
      ), 4),
      'mood', ROUND((
        COALESCE(
          CASE
            WHEN array_length(v_source_entry.mood, 1) > 0 AND array_length(se.mood, 1) > 0 THEN
              (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.mood, 1), array_length(se.mood, 1))
               FROM unnest(se.mood) m
               WHERE m = ANY(v_source_entry.mood)) * 0.20
            ELSE 0
          END,
          0
        )
      ), 4),
      'tags', ROUND((
        COALESCE(
          CASE
            WHEN array_length(v_source_entry.tags, 1) > 0 AND array_length(se.tags, 1) > 0 THEN
              (SELECT COUNT(*)::NUMERIC / GREATEST(array_length(v_source_entry.tags, 1), array_length(se.tags, 1))
               FROM unnest(se.tags) t
               WHERE t = ANY(v_source_entry.tags)) * 0.25
            ELSE 0
          END,
          0
        )
      ), 4),
      'place', CASE WHEN se.place = v_source_entry.place AND se.place IS NOT NULL AND se.place != '' THEN 0.15 ELSE 0 END,
      'person', CASE WHEN se.person = v_source_entry.person AND se.person IS NOT NULL AND se.person != '' THEN 0.10 ELSE 0 END,
      'temporal', ROUND(GREATEST(0, 0.05 * (1 - ABS(EXTRACT(EPOCH FROM (se.created_at - v_source_entry.created_at)) / (86400 * 30)))), 4),
      'popularity', ROUND(LEAST(0.05, COALESCE(se.likes, 0) * 0.005), 4)
    ) AS factors,
    to_jsonb(se.*) - 'score' AS entry
  FROM scored_entries se
  WHERE se.score > 0.05  -- Only return entries with meaningful similarity
  ORDER BY se.score DESC, se.created_at DESC  -- Secondary sort by recency for ties
  LIMIT p_max_results;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION archive.get_recommendations(UUID, INTEGER) TO authenticated, anon, service_role;

-- Add comment explaining the algorithm
COMMENT ON FUNCTION archive.get_recommendations IS 'Returns recommended entries based on similarity scoring:
- Color similarity (25%): Matching dominant colors
- Tags similarity (25%): Matching content tags
- Mood similarity (20%): Matching emotional/vibe tags
- Place match (15%): Same location
- Person match (10%): Same person
- Temporal proximity (5%): Photos from similar time period
- Popularity bonus (5%): Engagement signal from likes
Minimum score threshold: 0.05';
