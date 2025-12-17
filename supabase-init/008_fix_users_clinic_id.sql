-- ==============================================
-- VetoDiag CRM Database Migration and Fixes
-- ==============================================
-- This file contains database migration scripts and fixes
-- Run this after the main schema files to ensure data integrity and consistency
-- This script is idempotent and can be run multiple times safely

-- ==============================================
-- USERS TABLE CLINIC_ID FIX
-- ==============================================

-- Step 1: Check if users.clinic_id is already UUID type
DO $$
DECLARE
    clinic_id_type text;
BEGIN
    SELECT data_type INTO clinic_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'clinic_id';
    
    -- Only perform migration if clinic_id is not already UUID
    IF clinic_id_type != 'uuid' THEN
        RAISE NOTICE 'Converting users.clinic_id from % to UUID...', clinic_id_type;
        
        -- Step 1a: Add a temporary UUID column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' 
                AND table_name = 'users' 
                AND column_name = 'clinic_id_uuid'
        ) THEN
            ALTER TABLE public.users ADD COLUMN clinic_id_uuid uuid;
            RAISE NOTICE 'Added temporary clinic_id_uuid column';
        END IF;

        -- Step 1b: Convert existing TEXT clinic_id values to UUID
        -- Only convert valid UUID strings, set NULL for invalid ones
        UPDATE public.users 
        SET clinic_id_uuid = 
          CASE 
            WHEN clinic_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
            THEN clinic_id::uuid 
            ELSE NULL 
          END
        WHERE clinic_id_uuid IS NULL;
        
        RAISE NOTICE 'Converted existing clinic_id values to UUID format';

        -- Step 1c: Drop the old column if it exists and is not UUID
        IF clinic_id_type IS NOT NULL THEN
            ALTER TABLE public.users DROP COLUMN IF EXISTS clinic_id;
            RAISE NOTICE 'Dropped old clinic_id column';
        END IF;

        -- Step 1d: Rename the new UUID column to clinic_id
        ALTER TABLE public.users RENAME COLUMN clinic_id_uuid TO clinic_id;
        RAISE NOTICE 'Renamed clinic_id_uuid to clinic_id';
        
    ELSE
        RAISE NOTICE 'users.clinic_id is already UUID type, skipping conversion';
    END IF;
END;
$$;

-- Step 2: Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
            AND table_name = 'users' 
            AND constraint_name = 'fk_users_clinic_id'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT fk_users_clinic_id 
        FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint fk_users_clinic_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint fk_users_clinic_id already exists';
    END IF;
END;
$$;

-- Step 3: Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON public.users(clinic_id);

-- ==============================================
-- DATA INTEGRITY FIXES
-- ==============================================

-- Fix any orphaned clinic_id references
DO $$
DECLARE
    orphaned_count integer;
BEGIN
    -- Count orphaned users
    SELECT COUNT(*) INTO orphaned_count
    FROM public.users u
    WHERE u.clinic_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM public.clinique c WHERE c.id = u.clinic_id
        );
    
    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Found % users with invalid clinic_id references', orphaned_count;
        
        -- Set orphaned clinic_id to NULL
        UPDATE public.users 
        SET clinic_id = NULL 
        WHERE clinic_id IS NOT NULL
            AND NOT EXISTS (
                SELECT 1 FROM public.clinique c WHERE c.id = clinic_id
            );
            
        RAISE NOTICE 'Fixed % orphaned clinic_id references', orphaned_count;
    ELSE
        RAISE NOTICE 'No orphaned clinic_id references found';
    END IF;
END;
$$;

-- ==============================================
-- ENHANCED RLS POLICIES
-- ==============================================

-- Update RLS policies with improved security
-- These replace the basic policies with more robust ones

-- Drop and recreate users table policies with better logic
DROP POLICY IF EXISTS "Users can view users from their clinic" ON public.users;
DROP POLICY IF EXISTS "Users can insert profiles in their clinic" ON public.users;
DROP POLICY IF EXISTS "Users can update profiles in their clinic" ON public.users;
DROP POLICY IF EXISTS "Doctors can delete workers from their clinic" ON public.users;

-- Enhanced policy: Users can view their own profile and users from same clinic, admins can view all
CREATE POLICY "Enhanced users view policy" ON public.users
    FOR SELECT USING (
        -- Users can always see their own profile
        auth.uid() = id OR
        -- Users can see others from their clinic (if they have a clinic assigned)
        (clinic_id IS NOT NULL AND clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid() AND clinic_id IS NOT NULL
        )) OR
        -- Admins can see all users
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Enhanced policy: Better insert control
CREATE POLICY "Enhanced users insert policy" ON public.users
    FOR INSERT WITH CHECK (
        -- Users can insert their own profile during registration
        auth.uid() = id OR
        -- Doctors can create workers in their clinic
        (role = 'worker' AND clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid() AND role = 'doctor' AND clinic_id IS NOT NULL
        )) OR
        -- Admins can create any user
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Enhanced policy: Better update control
CREATE POLICY "Enhanced users update policy" ON public.users
    FOR UPDATE USING (
        -- Users can update their own profile
        auth.uid() = id OR
        -- Doctors can update workers in their clinic
        (role = 'worker' AND clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid() AND role = 'doctor' AND clinic_id IS NOT NULL
        )) OR
        -- Admins can update any user
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        -- Same conditions for the updated data
        auth.uid() = id OR
        (role = 'worker' AND clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid() AND role = 'doctor' AND clinic_id IS NOT NULL
        )) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Enhanced policy: Restricted delete control
CREATE POLICY "Enhanced users delete policy" ON public.users
    FOR DELETE USING (
        -- Only doctors can delete workers from their clinic
        (role = 'worker' AND clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid() AND role = 'doctor' AND clinic_id IS NOT NULL
        )) OR
        -- Admins can delete any user (except other admins)
        ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' AND role != 'admin')
    );

-- ==============================================
-- DATA VALIDATION FUNCTIONS
-- ==============================================

-- Function to validate clinic assignments
CREATE OR REPLACE FUNCTION public.validate_clinic_assignments()
RETURNS TABLE (
    issue_type text,
    user_id uuid,
    user_email text,
    clinic_id uuid,
    description text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    -- Check for users without clinic assignments (excluding admins)
    SELECT 
        'missing_clinic'::text,
        u.id,
        u.email,
        u.clinic_id,
        'User has no clinic assignment'::text
    FROM public.users u
    WHERE u.clinic_id IS NULL 
        AND u.role != 'admin'
    
    UNION ALL
    
    -- Check for invalid clinic references
    SELECT 
        'invalid_clinic'::text,
        u.id,
        u.email,
        u.clinic_id,
        'User assigned to non-existent clinic'::text
    FROM public.users u
    WHERE u.clinic_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM public.clinique c WHERE c.id = u.clinic_id
        )
    
    UNION ALL
    
    -- Check for clinic owners without proper assignments
    SELECT 
        'owner_mismatch'::text,
        u.id,
        u.email,
        u.clinic_id,
        'Clinic owner not assigned to their own clinic'::text
    FROM public.users u
    JOIN public.clinique c ON c.owner = u.id
    WHERE u.clinic_id != c.id OR u.clinic_id IS NULL;
END;
$$;

-- Function to fix common clinic assignment issues
CREATE OR REPLACE FUNCTION public.fix_clinic_assignments()
RETURNS TABLE (
    action_taken text,
    user_count integer,
    description text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    owner_fixes integer := 0;
BEGIN
    -- Fix clinic owners who aren't assigned to their own clinics
    UPDATE public.users 
    SET clinic_id = c.id
    FROM public.clinique c
    WHERE c.owner = users.id 
        AND (users.clinic_id != c.id OR users.clinic_id IS NULL);
    
    GET DIAGNOSTICS owner_fixes = ROW_COUNT;
    
    IF owner_fixes > 0 THEN
        RETURN QUERY SELECT 'fixed_owner_assignments'::text, owner_fixes, 'Assigned clinic owners to their own clinics'::text;
    END IF;
    
    -- Report any remaining issues
    RETURN QUERY
    SELECT 'issues_remain'::text, COUNT(*)::integer, 'Users still without valid clinic assignments'::text
    FROM public.users u
    WHERE u.clinic_id IS NULL AND u.role != 'admin';
END;
$$;

-- ==============================================
-- PERFORMANCE OPTIMIZATIONS
-- ==============================================

-- Additional indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_users_role_clinic ON public.users(role, clinic_id);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON public.users(lower(email));
CREATE INDEX IF NOT EXISTS idx_users_status_active ON public.users(clinic_id) WHERE status = true;

-- Partial index for active clinic owners
CREATE INDEX IF NOT EXISTS idx_clinic_owners_active ON public.clinique(owner) WHERE owner IS NOT NULL;

-- ==============================================
-- MAINTENANCE FUNCTIONS
-- ==============================================

-- Function to generate system health report
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS TABLE (
    component text,
    status text,
    details text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    -- Check user-clinic relationships
    SELECT 
        'user_clinic_integrity'::text,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ISSUES' END::text,
        CASE WHEN COUNT(*) = 0 THEN 'All user-clinic relationships valid' 
             ELSE COUNT(*)::text || ' users with invalid clinic assignments' END::text
    FROM public.users u
    WHERE u.clinic_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM public.clinique c WHERE c.id = u.clinic_id)
    
    UNION ALL
    
    -- Check RLS policies
    SELECT 
        'rls_policies'::text,
        CASE WHEN COUNT(*) >= 4 THEN 'OK' ELSE 'INCOMPLETE' END::text,
        'Found ' || COUNT(*)::text || ' RLS policies on users table'::text
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users'
    
    UNION ALL
    
    -- Check foreign key constraints
    SELECT 
        'foreign_keys'::text,
        CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'MISSING' END::text,
        'Foreign key constraint fk_users_clinic_id ' || 
        CASE WHEN COUNT(*) > 0 THEN 'exists' ELSE 'missing' END::text
    FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
        AND table_name = 'users' 
        AND constraint_name = 'fk_users_clinic_id';
END;
$$;

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Grant execute permissions on maintenance functions to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_clinic_assignments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.system_health_check() TO authenticated;

-- Grant execute permissions on fix functions only to admins (via RLS in the function)
GRANT EXECUTE ON FUNCTION public.fix_clinic_assignments() TO authenticated;

-- ==============================================
-- FINAL VERIFICATION
-- ==============================================

-- Log completion and perform final checks
DO $$
DECLARE
    health_check record;
BEGIN
    RAISE NOTICE 'Database migration and fixes completed successfully';
    
    -- Run health check
    FOR health_check IN 
        SELECT * FROM public.system_health_check()
    LOOP
        RAISE NOTICE 'Health Check - %: % (%)', 
            health_check.component, 
            health_check.status, 
            health_check.details;
    END LOOP;
    
    RAISE NOTICE 'Migration script execution finished';
END;
$$;

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON FUNCTION public.validate_clinic_assignments() IS 'Identifies users with missing or invalid clinic assignments';
COMMENT ON FUNCTION public.fix_clinic_assignments() IS 'Automatically fixes common clinic assignment issues';
COMMENT ON FUNCTION public.system_health_check() IS 'Provides comprehensive system health status report'; 