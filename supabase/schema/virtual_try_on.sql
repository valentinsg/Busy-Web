-- Virtual Try-On Schema
-- Stores try-on session history for analytics and user experience

-- Create virtual_try_on_sessions table
CREATE TABLE IF NOT EXISTS public.virtual_try_on_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image_url TEXT NOT NULL,
    person_image_url TEXT, -- Optional: stored in Supabase Storage
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    generated_images JSONB DEFAULT '[]'::jsonb, -- Array of generated image URLs/base64
    processing_time_ms INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vto_sessions_user_id ON public.virtual_try_on_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_vto_sessions_product_id ON public.virtual_try_on_sessions(product_id);
CREATE INDEX IF NOT EXISTS idx_vto_sessions_status ON public.virtual_try_on_sessions(status);
CREATE INDEX IF NOT EXISTS idx_vto_sessions_created_at ON public.virtual_try_on_sessions(created_at DESC);

-- RLS Policies
ALTER TABLE public.virtual_try_on_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own try-on sessions"
    ON public.virtual_try_on_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can create try-on sessions"
    ON public.virtual_try_on_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all sessions
CREATE POLICY "Admins can view all try-on sessions"
    ON public.virtual_try_on_sessions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.authors
            WHERE authors.id = auth.uid()
        )
    );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_vto_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vto_session_updated_at
    BEFORE UPDATE ON public.virtual_try_on_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_vto_session_updated_at();

-- Analytics view for admin dashboard
CREATE OR REPLACE VIEW public.virtual_try_on_analytics AS
SELECT
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS total_sessions,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_sessions,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_sessions,
    AVG(processing_time_ms) FILTER (WHERE status = 'completed') AS avg_processing_time_ms,
    COUNT(DISTINCT product_id) AS unique_products_tried,
    COUNT(DISTINCT user_id) AS unique_users
FROM public.virtual_try_on_sessions
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant access to analytics view for admins
GRANT SELECT ON public.virtual_try_on_analytics TO authenticated;

COMMENT ON TABLE public.virtual_try_on_sessions IS 'Stores virtual try-on session history for analytics';
COMMENT ON VIEW public.virtual_try_on_analytics IS 'Aggregated analytics for virtual try-on feature';
