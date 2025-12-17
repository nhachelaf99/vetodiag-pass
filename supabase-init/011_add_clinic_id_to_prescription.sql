-- Migration: Add clinic_id to prescription table
-- Date: 2025-11-04
-- Purpose: Add clinic reference to prescription table for proper data isolation

-- Add clinic_id column to prescription table
ALTER TABLE public.prescription 
ADD COLUMN IF NOT EXISTS clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_prescription_clinic_id ON public.prescription(clinic_id);

-- Add comment
COMMENT ON COLUMN public.prescription.clinic_id IS 'Reference to the clinic that created this prescription';

-- Data migration: Update existing prescriptions with clinic_id from their patient's clinic
UPDATE prescription p
SET clinic_id = pat.clinic_id
FROM patient pat
WHERE p.patient_id = pat.id
  AND p.clinic_id IS NULL
  AND pat.clinic_id IS NOT NULL;
