-- EMERGENCY FIX: DROP RECURSIVE POLICIES TO RESTORE ACCESS
-- Run this immediately to stop database timeouts

DROP POLICY IF EXISTS "Users can view users from their clinic" ON public.users;
DROP POLICY IF EXISTS "Users can view appointments from their clinic" ON public.rdv;
DROP FUNCTION IF EXISTS get_auth_user_clinic_id();
DROP FUNCTION IF EXISTS auth_user_is_admin();

-- Temporary simple policy to allow self-access only (no recursion)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Allow reading all RDVs for now (or limit to own) to test connectivity
-- CREATE POLICY "Users can view own appointments" ON public.rdv
--     FOR SELECT USING (true); 
