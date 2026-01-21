-- Add email column to organizations table for recruiters
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS email text;
