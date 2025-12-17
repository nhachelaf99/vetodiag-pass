-- Allow authenticated users to view all clinics (for booking)
DROP POLICY IF EXISTS "Users can view their clinic" ON public.clinique;

CREATE POLICY "Authenticated users can view all clinics" ON public.clinique
    FOR SELECT USING (auth.role() = 'authenticated');

-- Ensure RDV allows inserting if you belong to the user (owner_id logic might be needed later, 
-- but for now rely on basic authenticated access or existing policies if fixed)
