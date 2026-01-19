-- ================================================================
-- Reset User Onboarding Status
-- Run this in Supabase SQL Editor to reset your user for proper onboarding
-- ================================================================

-- First, find your user by email (replace with your actual email)
SELECT * FROM profiles WHERE email = 'jethrojerryad@gmail.com';

-- Reset the onboarding status and role to allow re-selection
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles
SET 
  onboarding_completed = false,
  organization_id = NULL
WHERE email = 'jethrojerryad@gmail.com';

-- Optionally, delete any partially created organization
-- DELETE FROM public.organizations 
-- WHERE created_by = (SELECT id FROM public.profiles WHERE email = 'jethrojerryad@gmail.com');
