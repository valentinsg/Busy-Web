-- Create newsletter_campaign_recipients table
-- This table stores the snapshot of recipients for each campaign

CREATE TABLE IF NOT EXISTS public.newsletter_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready', -- ready, sent, failed, bounced
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint to prevent duplicate emails per campaign
  UNIQUE(campaign_id, email)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id
ON public.newsletter_campaign_recipients(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status
ON public.newsletter_campaign_recipients(status);

-- Enable RLS
ALTER TABLE public.newsletter_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role has full access to campaign recipients"
ON public.newsletter_campaign_recipients
FOR ALL
USING (true)
WITH CHECK (true);
