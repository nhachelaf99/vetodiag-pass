-- Fix for RLS infinite recursion
-- Run this in your Supabase SQL Editor

-- 1. Create helper function to get clinic_id without triggering RLS on users table recursively
CREATE OR REPLACE FUNCTION get_auth_user_clinic_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.users WHERE id = auth.uid();
$$;

-- 2. Create helper function to check admin role
CREATE OR REPLACE FUNCTION auth_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$;

-- 3. Update Users Policy to use functions
DROP POLICY IF EXISTS "Users can view users from their clinic" ON public.users;

CREATE POLICY "Users can view users from their clinic" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR
        clinic_id = get_auth_user_clinic_id() OR
        auth_user_is_admin()
    );

-- 4. Update RDV Policy to use functions
DROP POLICY IF EXISTS "Users can view appointments from their clinic" ON public.rdv;

CREATE POLICY "Users can view appointments from their clinic" ON public.rdv
    FOR SELECT USING (
        clinic_id = get_auth_user_clinic_id() OR
        auth_user_is_admin()
    );
