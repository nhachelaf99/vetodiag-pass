-- Fix missing relationships and reload API cache
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Ensure Foreign Key exists for Clinic
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'rdv_clinic_id_fkey'
    ) THEN
        ALTER TABLE public.rdv 
        ADD CONSTRAINT rdv_clinic_id_fkey 
        FOREIGN KEY (clinic_id) 
        REFERENCES public.clinique(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Ensure Foreign Key exists for Patient
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'rdv_patient_id_fkey'
    ) THEN
        ALTER TABLE public.rdv 
        ADD CONSTRAINT rdv_patient_id_fkey 
        FOREIGN KEY (patient_id) 
        REFERENCES public.patient(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Reload PostgREST schema cache to detect the new relationships
NOTIFY pgrst, 'reload config';

COMMIT;
