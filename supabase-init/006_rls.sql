-- ==============================================
-- VetoDiag CRM Row Level Security (RLS) Policies
-- ==============================================
-- This file defines all RLS policies for the VetoDiag CRM system
-- Run this after creating tables, functions, relations, and triggers

-- ==============================================
-- ENABLE RLS ON ALL TABLES
-- ==============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinique ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vermifugation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deparasitage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicament ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medication ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_procedure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_campaign ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- USERS TABLE POLICIES
-- ==============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view users from their clinic" ON public.users;
DROP POLICY IF EXISTS "Users can insert profiles in their clinic" ON public.users;
DROP POLICY IF EXISTS "Users can update profiles in their clinic" ON public.users;
DROP POLICY IF EXISTS "Doctors can delete workers from their clinic" ON public.users;

-- Users can view their own profile and users from same clinic, admins can view all
CREATE POLICY "Users can view users from their clinic" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Authenticated users can insert their own profile OR doctors can create workers in their clinic
CREATE POLICY "Users can insert profiles in their clinic" ON public.users
    FOR INSERT WITH CHECK (
        auth.uid() = id OR
        (clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid() AND role = 'doctor'
        ) AND role = 'worker') OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Users can update their own profile or doctors can update workers in their clinic
CREATE POLICY "Users can update profiles in their clinic" ON public.users
    FOR UPDATE USING (
        auth.uid() = id OR
        (clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid() AND role = 'doctor'
        )) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        auth.uid() = id OR
        (clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid() AND role = 'doctor'
        )) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Only doctors can delete workers from their clinic, admins can delete anyone
CREATE POLICY "Doctors can delete workers from their clinic" ON public.users
    FOR DELETE USING (
        (clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid() AND role = 'doctor'
        ) AND role = 'worker') OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- ==============================================
-- CLINIQUE TABLE POLICIES
-- ==============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their clinic" ON public.clinique;
DROP POLICY IF EXISTS "Clinic owners can manage their clinic" ON public.clinique;

-- Users can view their assigned clinic
CREATE POLICY "Users can view their clinic" ON public.clinique
    FOR SELECT USING (
        id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        owner = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Clinic owners and admins can manage clinics
CREATE POLICY "Clinic owners can manage their clinic" ON public.clinique
    FOR ALL USING (
        owner = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        owner = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- ==============================================
-- CLINIC-SCOPED TABLE POLICIES (CLIENT, PATIENT, etc.)
-- ==============================================

-- Generic policy template for clinic-scoped tables
-- Users can only access records from their clinic

-- CLIENT TABLE POLICIES
DROP POLICY IF EXISTS "Users can view clients from their clinic" ON public.client;
DROP POLICY IF EXISTS "Users can manage clients from their clinic" ON public.client;

CREATE POLICY "Users can view clients from their clinic" ON public.client
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage clients from their clinic" ON public.client
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- PATIENT TABLE POLICIES
DROP POLICY IF EXISTS "Users can view patients from their clinic" ON public.patient;
DROP POLICY IF EXISTS "Users can manage patients from their clinic" ON public.patient;

CREATE POLICY "Users can view patients from their clinic" ON public.patient
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage patients from their clinic" ON public.patient
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- VACCINATION TABLE POLICIES
DROP POLICY IF EXISTS "Users can view vaccinations from their clinic" ON public.vaccination;
DROP POLICY IF EXISTS "Users can manage vaccinations from their clinic" ON public.vaccination;

CREATE POLICY "Users can view vaccinations from their clinic" ON public.vaccination
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage vaccinations from their clinic" ON public.vaccination
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- VERMIFUGATION TABLE POLICIES
DROP POLICY IF EXISTS "Users can view vermifugations from their clinic" ON public.vermifugation;
DROP POLICY IF EXISTS "Users can manage vermifugations from their clinic" ON public.vermifugation;

CREATE POLICY "Users can view vermifugations from their clinic" ON public.vermifugation
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage vermifugations from their clinic" ON public.vermifugation
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- DEPARASITAGE TABLE POLICIES
DROP POLICY IF EXISTS "Users can view deparasitages from their clinic" ON public.deparasitage;
DROP POLICY IF EXISTS "Users can manage deparasitages from their clinic" ON public.deparasitage;

CREATE POLICY "Users can view deparasitages from their clinic" ON public.deparasitage
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage deparasitages from their clinic" ON public.deparasitage
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- CLINICAL CASE TABLE POLICIES
DROP POLICY IF EXISTS "Users can view clinical cases from their clinic" ON public.clinical_case;
DROP POLICY IF EXISTS "Users can manage clinical cases from their clinic" ON public.clinical_case;

CREATE POLICY "Users can view clinical cases from their clinic" ON public.clinical_case
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage clinical cases from their clinic" ON public.clinical_case
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- OBSERVATION TABLE POLICIES
DROP POLICY IF EXISTS "Users can view observations from their clinic" ON public.observation;
DROP POLICY IF EXISTS "Users can manage observations from their clinic" ON public.observation;

CREATE POLICY "Users can view observations from their clinic" ON public.observation
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage observations from their clinic" ON public.observation
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- RDV (APPOINTMENTS) TABLE POLICIES
DROP POLICY IF EXISTS "Users can view appointments from their clinic" ON public.rdv;
DROP POLICY IF EXISTS "Users can manage appointments from their clinic" ON public.rdv;

CREATE POLICY "Users can view appointments from their clinic" ON public.rdv
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage appointments from their clinic" ON public.rdv
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- ==============================================
-- PRESCRIPTION AND MEDICATION POLICIES
-- ==============================================

-- PRESCRIPTION TABLE POLICIES
DROP POLICY IF EXISTS "Users can view prescriptions from their clinic" ON public.prescription;
DROP POLICY IF EXISTS "Users can manage prescriptions from their clinic" ON public.prescription;

CREATE POLICY "Users can view prescriptions from their clinic" ON public.prescription
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage prescriptions from their clinic" ON public.prescription
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- PRESCRIPTION MEDICATION TABLE POLICIES (linked via prescription)
DROP POLICY IF EXISTS "Users can view prescription medications from their clinic" ON public.prescription_medication;
DROP POLICY IF EXISTS "Users can manage prescription medications from their clinic" ON public.prescription_medication;

CREATE POLICY "Users can view prescription medications from their clinic" ON public.prescription_medication
    FOR SELECT USING (
        prescription_id IN (
            SELECT id FROM public.prescription WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage prescription medications from their clinic" ON public.prescription_medication
    FOR ALL USING (
        prescription_id IN (
            SELECT id FROM public.prescription WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        prescription_id IN (
            SELECT id FROM public.prescription WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- MEDICAMENT TABLE POLICIES (globally accessible for reference)
DROP POLICY IF EXISTS "All authenticated users can view medicaments" ON public.medicament;
DROP POLICY IF EXISTS "Only admins can manage medicaments" ON public.medicament;

CREATE POLICY "All authenticated users can view medicaments" ON public.medicament
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage medicaments" ON public.medicament
    FOR ALL USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- ==============================================
-- ANIMAL PROCEDURE POLICIES
-- ==============================================

-- ANIMAL PROCEDURE TABLE POLICIES
DROP POLICY IF EXISTS "Users can view animal procedures from their clinic" ON public.animal_procedure;
DROP POLICY IF EXISTS "Users can manage animal procedures from their clinic" ON public.animal_procedure;

CREATE POLICY "Users can view animal procedures from their clinic" ON public.animal_procedure
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage animal procedures from their clinic" ON public.animal_procedure
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- SURGERY DETAILS TABLE POLICIES (linked via procedure)
DROP POLICY IF EXISTS "Users can view surgery details from their clinic" ON public.surgery_details;
DROP POLICY IF EXISTS "Users can manage surgery details from their clinic" ON public.surgery_details;

CREATE POLICY "Users can view surgery details from their clinic" ON public.surgery_details
    FOR SELECT USING (
        procedure_id IN (
            SELECT id FROM public.animal_procedure WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage surgery details from their clinic" ON public.surgery_details
    FOR ALL USING (
        procedure_id IN (
            SELECT id FROM public.animal_procedure WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        procedure_id IN (
            SELECT id FROM public.animal_procedure WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- MEDICATION DETAILS TABLE POLICIES (linked via procedure)
DROP POLICY IF EXISTS "Users can view medication details from their clinic" ON public.medication_details;
DROP POLICY IF EXISTS "Users can manage medication details from their clinic" ON public.medication_details;

CREATE POLICY "Users can view medication details from their clinic" ON public.medication_details
    FOR SELECT USING (
        procedure_id IN (
            SELECT id FROM public.animal_procedure WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage medication details from their clinic" ON public.medication_details
    FOR ALL USING (
        procedure_id IN (
            SELECT id FROM public.animal_procedure WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        procedure_id IN (
            SELECT id FROM public.animal_procedure WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- PREVENTIVE DETAILS TABLE POLICIES (linked via procedure)
DROP POLICY IF EXISTS "Users can view preventive details from their clinic" ON public.preventive_details;
DROP POLICY IF EXISTS "Users can manage preventive details from their clinic" ON public.preventive_details;

CREATE POLICY "Users can view preventive details from their clinic" ON public.preventive_details
    FOR SELECT USING (
        procedure_id IN (
            SELECT id FROM public.animal_procedure WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage preventive details from their clinic" ON public.preventive_details
    FOR ALL USING (
        procedure_id IN (
            SELECT id FROM public.animal_procedure WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        procedure_id IN (
            SELECT id FROM public.animal_procedure WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- ==============================================
-- CAMPAIGN AND FARM POLICIES
-- ==============================================

-- VACCINATION CAMPAIGN TABLE POLICIES
DROP POLICY IF EXISTS "Users can view vaccination campaigns from their clinic" ON public.vaccination_campaign;
DROP POLICY IF EXISTS "Users can manage vaccination campaigns from their clinic" ON public.vaccination_campaign;

CREATE POLICY "Users can view vaccination campaigns from their clinic" ON public.vaccination_campaign
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage vaccination campaigns from their clinic" ON public.vaccination_campaign
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- FARM TABLE POLICIES
DROP POLICY IF EXISTS "Users can view farms from their clinic" ON public.farm;
DROP POLICY IF EXISTS "Users can manage farms from their clinic" ON public.farm;

CREATE POLICY "Users can view farms from their clinic" ON public.farm
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage farms from their clinic" ON public.farm
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- FARM HEALTH RECORDS TABLE POLICIES (linked via farm)
DROP POLICY IF EXISTS "Users can view farm health records from their clinic" ON public.farm_health_records;
DROP POLICY IF EXISTS "Users can manage farm health records from their clinic" ON public.farm_health_records;

CREATE POLICY "Users can view farm health records from their clinic" ON public.farm_health_records
    FOR SELECT USING (
        id_farm IN (
            SELECT id FROM public.farm WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage farm health records from their clinic" ON public.farm_health_records
    FOR ALL USING (
        id_farm IN (
            SELECT id FROM public.farm WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        id_farm IN (
            SELECT id FROM public.farm WHERE clinic_id IN (
                SELECT clinic_id FROM public.users WHERE id = auth.uid()
            )
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- ==============================================
-- FINANCIAL POLICIES
-- ==============================================

-- PRICE SERVICES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view price services from their clinic" ON public.price_services;
DROP POLICY IF EXISTS "Users can manage price services from their clinic" ON public.price_services;

CREATE POLICY "Users can view price services from their clinic" ON public.price_services
    FOR SELECT USING (
        id_clinique IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage price services from their clinic" ON public.price_services
    FOR ALL USING (
        id_clinique IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        id_clinique IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- PAYMENTS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view payments from their clinic" ON public.payments;
DROP POLICY IF EXISTS "Users can manage payments from their clinic" ON public.payments;

CREATE POLICY "Users can view payments from their clinic" ON public.payments
    FOR SELECT USING (
        id_clinique IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage payments from their clinic" ON public.payments
    FOR ALL USING (
        id_clinique IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        id_clinique IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- SUBSCRIPTION TABLE POLICIES
DROP POLICY IF EXISTS "Users can view their subscriptions" ON public.subscription;
DROP POLICY IF EXISTS "Users can manage their subscriptions" ON public.subscription;

CREATE POLICY "Users can view their subscriptions" ON public.subscription
    FOR SELECT USING (
        id_owner = auth.uid() OR
        id_clinique IN (
            SELECT clinic_id FROM public.users 
            WHERE id = auth.uid()
        ) OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can manage their subscriptions" ON public.subscription
    FOR ALL USING (
        id_owner = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        id_owner = auth.uid() OR
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Grant necessary table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read-only access to some reference tables for anon users (if needed)
GRANT SELECT ON public.medicament TO anon;

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON POLICY "Users can view users from their clinic" ON public.users IS 'Users can view their own profile and colleagues from same clinic, admins can view all';
COMMENT ON POLICY "Users can insert profiles in their clinic" ON public.users IS 'Doctors can create worker profiles in their clinic, users can create their own profile';
COMMENT ON POLICY "Users can view clients from their clinic" ON public.client IS 'Users can only view clients belonging to their clinic';
COMMENT ON POLICY "Users can view patients from their clinic" ON public.patient IS 'Users can only view patients belonging to their clinic';
COMMENT ON POLICY "All authenticated users can view medicaments" ON public.medicament IS 'Medicament database is globally accessible for reference';
COMMENT ON POLICY "Only admins can manage medicaments" ON public.medicament IS 'Only system administrators can modify the medicament database';
COMMENT ON POLICY "Users can view their subscriptions" ON public.subscription IS 'Users can view subscriptions they own or for their clinic';
