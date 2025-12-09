-- Newsletter Campaign Events Table
-- Stores tracking events from Resend webhooks (opens, clicks, bounces, etc.)

CREATE TABLE IF NOT EXISTS public.newsletter_campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed'
  link_url TEXT, -- For click events, which link was clicked
  user_agent TEXT, -- Browser/client info
  ip_address TEXT, -- Anonymized IP
  metadata JSONB DEFAULT '{}', -- Additional event data from Resend
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_newsletter_events_campaign ON public.newsletter_campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_email ON public.newsletter_campaign_events(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_type ON public.newsletter_campaign_events(event_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_created ON public.newsletter_campaign_events(created_at);

-- Unique constraint to prevent duplicate events
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_events_unique
ON public.newsletter_campaign_events(campaign_id, email, event_type, link_url, created_at);

-- Add CTA fields to campaigns table
ALTER TABLE public.newsletter_campaigns
ADD COLUMN IF NOT EXISTS cta_text TEXT,
ADD COLUMN IF NOT EXISTS cta_url TEXT;

-- Add tracking stats columns for quick access (denormalized for performance)
ALTER TABLE public.newsletter_campaigns
ADD COLUMN IF NOT EXISTS delivered_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribed_count INTEGER DEFAULT 0;

-- RLS Policies
ALTER TABLE public.newsletter_campaign_events ENABLE ROW LEVEL SECURITY;

-- Only admins can read events (check by email in auth.users matching authors)
CREATE POLICY "Admins can read newsletter events"
ON public.newsletter_campaign_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email IN (
      SELECT email FROM public.authors WHERE active = true
    )
  )
);

-- Service role can insert (for webhooks)
CREATE POLICY "Service can insert newsletter events"
ON public.newsletter_campaign_events
FOR INSERT
TO service_role
WITH CHECK (true);

-- Also allow anon/authenticated to insert for webhook compatibility
CREATE POLICY "Webhook can insert newsletter events"
ON public.newsletter_campaign_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

COMMENT ON TABLE public.newsletter_campaign_events IS 'Tracking events for newsletter campaigns from Resend webhooks';
