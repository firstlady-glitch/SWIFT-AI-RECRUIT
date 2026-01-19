-- ================================================================
-- External Application Link Support Migration
-- Run this after supabase-additions.sql
-- ================================================================

-- Add external application support to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS external_apply_url text,
ADD COLUMN IF NOT EXISTS application_type text DEFAULT 'internal' 
  CHECK (application_type IN ('internal', 'external'));

-- Add comment for documentation
COMMENT ON COLUMN public.jobs.external_apply_url IS 'URL for external job applications (redirects away from platform)';
COMMENT ON COLUMN public.jobs.application_type IS 'internal = apply on platform, external = redirect to URL';

-- =============================================
-- Click Analytics Table for External Links
-- =============================================
CREATE TABLE IF NOT EXISTS public.job_click_analytics (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  clicked_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text
);

-- Enable RLS
ALTER TABLE public.job_click_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies: Job Click Analytics
-- =============================================

-- Job posters can view click analytics for their jobs
CREATE POLICY "Job posters can view their job clicks"
  ON public.job_click_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_click_analytics.job_id
      AND jobs.posted_by = auth.uid()
    )
  );

-- Organization members can view click analytics for org jobs
CREATE POLICY "Org members can view job clicks"
  ON public.job_click_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      JOIN public.profiles ON profiles.organization_id = jobs.organization_id
      WHERE jobs.id = job_click_analytics.job_id
      AND profiles.id = auth.uid()
    )
  );

-- Anyone can insert click analytics (for tracking)
CREATE POLICY "Anyone can record job clicks"
  ON public.job_click_analytics FOR INSERT
  WITH CHECK (true);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_job_clicks_job_id ON public.job_click_analytics(job_id);
CREATE INDEX IF NOT EXISTS idx_job_clicks_clicked_at ON public.job_click_analytics(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_application_type ON public.jobs(application_type);
