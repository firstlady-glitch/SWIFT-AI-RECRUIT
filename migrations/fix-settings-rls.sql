-- ================================================================
-- Debug and Fix RLS for Profile + Organization Query
-- Run this in Supabase SQL Editor
-- ================================================================

-- STEP 1: Check current policies on profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- STEP 2: Check current policies on organizations
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'organizations';

-- STEP 3: The issue is likely that organizations can only be viewed by members
-- But you're trying to join profiles with organizations
-- Let's ensure users can read their own organization

-- First, let's test if your profile can be read directly:
SELECT * FROM profiles WHERE id = '00e571c4-91e2-4972-b710-19bb092d77d0';

-- Now test if org can be read:
SELECT * FROM organizations WHERE id = 'b4a935bb-41b4-4965-96bd-bd5e1ec6f3e2';

-- STEP 4: If either query fails, we need to fix RLS
-- The organizations policy "Organizations are viewable by everyone" should allow SELECT
-- But if it was dropped or modified, we need to recreate it:

-- Recreate the basic read policies:
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;
CREATE POLICY "Organizations are viewable by everyone"
  ON public.organizations FOR SELECT
  USING (true);

-- STEP 5: Ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- STEP 6: Ensure org members can update their organization
DROP POLICY IF EXISTS "Organization members can update their organization" ON public.organizations;
CREATE POLICY "Organization members can update their organization"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.organization_id = organizations.id
    )
  );
