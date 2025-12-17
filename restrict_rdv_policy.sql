-- Secure RLS Policy for RDV (Appointments)
-- Ensures users can ONLY see appointments for their own pets (linked via Personal Clinic ID)

BEGIN;

-- 1. Enable RLS on RDV if not enabled
ALTER TABLE public.rdv ENABLE ROW LEVEL SECURITY;

-- 2. Drop insecure or recursive policies
DROP POLICY IF EXISTS "Users can view appointments from their clinic" ON public.rdv;
DROP POLICY IF EXISTS "Users can view own appointments" ON public.rdv; -- From emergency fix

-- 3. Create strict policy:
-- Viewable if the appointment's patient belongs to the user's "Personal Clinic".
-- We access users.clinic_id via the auth.uid() lookup helper function to avoid recursion if users table has policies.
-- Or better, we join directly to the patient table which has the clinic_id.

CREATE POLICY "Users can only view their own pets appointments" ON public.rdv
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patient p
            WHERE p.id = rdv.patient_id
            AND p.clinic_id = (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        )
        OR 
        -- Also allow viewing if I am the Clinic Owner (Target Vet) - for completeness, though fetching logic might differ
        clinic_id = (SELECT clinic_id FROM public.users WHERE id = auth.uid())
    );

-- 4. Allow insert if I own the patient
CREATE POLICY "Users can create appointments for their pets" ON public.rdv
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.patient p
            WHERE p.id = patient_id
            AND p.clinic_id = (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        )
    );

COMMIT;
