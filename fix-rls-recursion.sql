-- ================================================================
-- Fix Infinite Recursion in RLS Policies
-- Run this migration to fix the "infinite recursion detected in 
-- policy for relation 'profiles'" error
-- ================================================================

-- ==============================================
-- THE PROBLEM:
-- The admin policies query the profiles table to check if user is admin,
-- but this triggers the same policy check, causing infinite recursion.
-- ==============================================

-- ==============================================
-- Step 1: Drop the problematic admin policies
-- ==============================================

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins have full access to jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins have full access to applications" ON public.applications;

-- ==============================================
-- Step 2: Create a helper function that uses auth.jwt()
-- This avoids querying the profiles table directly
-- ==============================================

-- First, you need to add a custom claim to Supabase for admin role.
-- For now, we'll use a security definer function as a workaround.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- ==============================================
-- Step 3: Re-create admin policies using the helper function
-- SECURITY DEFINER functions bypass RLS, preventing recursion
-- ==============================================

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins have full access to organizations"
  ON public.organizations FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins have full access to jobs"
  ON public.jobs FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins have full access to applications"
  ON public.applications FOR ALL
  USING (public.is_admin());

-- ==============================================
-- Step 4: Fix team_members table self-referencing policies
-- These also cause recursion when querying team_members from team_members
-- ==============================================

DROP POLICY IF EXISTS "Team members can view their team" ON public.team_members;
DROP POLICY IF EXISTS "Org admins can manage team" ON public.team_members;

-- Create a helper function for team membership check
CREATE OR REPLACE FUNCTION public.is_team_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE organization_id = org_id
    AND profile_id = auth.uid()
  );
$$;

-- Create a helper function for org admin check
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE organization_id = org_id
    AND profile_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
$$;

-- Re-create team policies using helper functions
CREATE POLICY "Team members can view their team"
  ON public.team_members FOR SELECT
  USING (
    profile_id = auth.uid() OR
    public.is_team_member(organization_id)
  );

CREATE POLICY "Org admins can manage team"
  ON public.team_members FOR ALL
  USING (public.is_org_admin(organization_id));

-- ==============================================
-- Done! These changes fix the infinite recursion by using
-- SECURITY DEFINER functions which bypass RLS checks.
-- ==============================================
