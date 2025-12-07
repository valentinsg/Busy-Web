-- Add persist_dismissal column to popovers table
-- When true (default): user dismissal is saved to localStorage, popup won't show again
-- When false: popup will show again on each page reload/session

ALTER TABLE public.popovers
ADD COLUMN IF NOT EXISTS persist_dismissal BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.popovers.persist_dismissal IS 'If true, remember when user closes popup (won''t show again). If false, popup shows on every session.';
