-- ================================================================
-- Site Settings Table for Admin Configuration
-- Run this in Supabase SQL Editor
-- ================================================================

-- Create site_settings table (singleton pattern - one row for all settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Payment Settings
  payments_enabled BOOLEAN DEFAULT true,
  
  -- User Management
  allow_registration BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,
  
  -- Notifications
  email_notifications BOOLEAN DEFAULT true,
  
  -- Maintenance
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT DEFAULT 'We are currently performing maintenance. Please check back soon.',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings (needed for the site to work)
CREATE POLICY "Site settings are viewable by everyone"
  ON public.site_settings FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Only admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can insert settings (for initial setup)
CREATE POLICY "Only admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at 
  BEFORE UPDATE ON public.site_settings 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert default settings row (run only once)
INSERT INTO public.site_settings (
  payments_enabled,
  allow_registration,
  require_approval,
  email_notifications,
  maintenance_mode
) VALUES (
  true,
  true,
  false,
  true,
  false
) ON CONFLICT DO NOTHING;
