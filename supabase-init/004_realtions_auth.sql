-- ==============================================
-- VetoDiag CRM Database Relations and Constraints
-- ==============================================
-- This file defines all foreign key relationships and constraints
-- Run this after creating tables, buckets, and functions

-- ==============================================
-- FOREIGN KEY CONSTRAINTS
-- ==============================================

-- Add foreign key constraint for users.clinic_id to clinique.id
-- This was missing from the original schema and is critical for data integrity
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS fk_users_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Ensure all existing foreign keys are properly defined with consistent naming

-- Client table foreign keys
ALTER TABLE public.client 
ADD CONSTRAINT IF NOT EXISTS fk_client_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Patient table foreign keys
ALTER TABLE public.patient 
ADD CONSTRAINT IF NOT EXISTS fk_patient_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

ALTER TABLE public.patient 
ADD CONSTRAINT IF NOT EXISTS fk_patient_owner_id 
FOREIGN KEY (owner_id) REFERENCES public.client(id) ON DELETE SET NULL;

-- Vaccination table foreign keys
ALTER TABLE public.vaccination 
ADD CONSTRAINT IF NOT EXISTS fk_vaccination_patient_id 
FOREIGN KEY (patient_id) REFERENCES public.patient(id) ON DELETE SET NULL;

ALTER TABLE public.vaccination 
ADD CONSTRAINT IF NOT EXISTS fk_vaccination_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Vermifugation table foreign keys
ALTER TABLE public.vermifugation 
ADD CONSTRAINT IF NOT EXISTS fk_vermifugation_patient_id 
FOREIGN KEY (patient_id) REFERENCES public.patient(id) ON DELETE SET NULL;

ALTER TABLE public.vermifugation 
ADD CONSTRAINT IF NOT EXISTS fk_vermifugation_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Deparasitage table foreign keys
ALTER TABLE public.deparasitage 
ADD CONSTRAINT IF NOT EXISTS fk_deparasitage_patient_id 
FOREIGN KEY (patient_id) REFERENCES public.patient(id) ON DELETE SET NULL;

ALTER TABLE public.deparasitage 
ADD CONSTRAINT IF NOT EXISTS fk_deparasitage_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Clinical case table foreign keys
ALTER TABLE public.clinical_case 
ADD CONSTRAINT IF NOT EXISTS fk_clinical_case_patient_id 
FOREIGN KEY (patient_id) REFERENCES public.patient(id) ON DELETE SET NULL;

ALTER TABLE public.clinical_case 
ADD CONSTRAINT IF NOT EXISTS fk_clinical_case_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Observation table foreign keys
ALTER TABLE public.observation 
ADD CONSTRAINT IF NOT EXISTS fk_observation_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- RDV (appointments) table foreign keys
ALTER TABLE public.rdv 
ADD CONSTRAINT IF NOT EXISTS fk_rdv_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

ALTER TABLE public.rdv 
ADD CONSTRAINT IF NOT EXISTS fk_rdv_patient_id 
FOREIGN KEY (patient_id) REFERENCES public.patient(id) ON DELETE SET NULL;

-- Prescription table foreign keys
ALTER TABLE public.prescription 
ADD CONSTRAINT IF NOT EXISTS fk_prescription_patient_id 
FOREIGN KEY (patient_id) REFERENCES public.patient(id) ON DELETE SET NULL;

ALTER TABLE public.prescription 
ADD CONSTRAINT IF NOT EXISTS fk_prescription_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Prescription medication table foreign keys
ALTER TABLE public.prescription_medication 
ADD CONSTRAINT IF NOT EXISTS fk_prescription_medication_prescription_id 
FOREIGN KEY (prescription_id) REFERENCES public.prescription(id) ON DELETE CASCADE;

-- Animal procedure table foreign keys
ALTER TABLE public.animal_procedure 
ADD CONSTRAINT IF NOT EXISTS fk_animal_procedure_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Surgery details table foreign keys
ALTER TABLE public.surgery_details 
ADD CONSTRAINT IF NOT EXISTS fk_surgery_details_procedure_id 
FOREIGN KEY (procedure_id) REFERENCES public.animal_procedure(id) ON DELETE CASCADE;

-- Medication details table foreign keys
ALTER TABLE public.medication_details 
ADD CONSTRAINT IF NOT EXISTS fk_medication_details_procedure_id 
FOREIGN KEY (procedure_id) REFERENCES public.animal_procedure(id) ON DELETE CASCADE;

-- Preventive details table foreign keys
ALTER TABLE public.preventive_details 
ADD CONSTRAINT IF NOT EXISTS fk_preventive_details_procedure_id 
FOREIGN KEY (procedure_id) REFERENCES public.animal_procedure(id) ON DELETE CASCADE;

-- Vaccination campaign table foreign keys
ALTER TABLE public.vaccination_campaign 
ADD CONSTRAINT IF NOT EXISTS fk_vaccination_campaign_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Farm table foreign keys
ALTER TABLE public.farm 
ADD CONSTRAINT IF NOT EXISTS fk_farm_clinic_id 
FOREIGN KEY (clinic_id) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Farm health records table foreign keys
ALTER TABLE public.farm_health_records 
ADD CONSTRAINT IF NOT EXISTS fk_farm_health_records_farm_id 
FOREIGN KEY (id_farm) REFERENCES public.farm(id) ON DELETE CASCADE;

-- Price services table foreign keys
ALTER TABLE public.price_services 
ADD CONSTRAINT IF NOT EXISTS fk_price_services_clinic_id 
FOREIGN KEY (id_clinique) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Payments table foreign keys
ALTER TABLE public.payments 
ADD CONSTRAINT IF NOT EXISTS fk_payments_client_id 
FOREIGN KEY (client_id) REFERENCES public.client(id) ON DELETE SET NULL;

ALTER TABLE public.payments 
ADD CONSTRAINT IF NOT EXISTS fk_payments_patient_id 
FOREIGN KEY (patient_id) REFERENCES public.patient(id) ON DELETE SET NULL;

ALTER TABLE public.payments 
ADD CONSTRAINT IF NOT EXISTS fk_payments_service_id 
FOREIGN KEY (service_id) REFERENCES public.price_services(id) ON DELETE SET NULL;

ALTER TABLE public.payments 
ADD CONSTRAINT IF NOT EXISTS fk_payments_clinic_id 
FOREIGN KEY (id_clinique) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- Subscription table foreign keys
ALTER TABLE public.subscription 
ADD CONSTRAINT IF NOT EXISTS fk_subscription_owner_id 
FOREIGN KEY (id_owner) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.subscription 
ADD CONSTRAINT IF NOT EXISTS fk_subscription_clinic_id 
FOREIGN KEY (id_clinique) REFERENCES public.clinique(id) ON DELETE SET NULL;

-- ==============================================
-- UNIQUE CONSTRAINTS
-- ==============================================

-- Ensure email uniqueness in users table (already defined but ensuring consistency)
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS unique_users_email 
UNIQUE (email);

-- Ensure unique case numbers in observation table
ALTER TABLE public.observation 
ADD CONSTRAINT IF NOT EXISTS unique_observation_case_number 
UNIQUE (case_number);

-- Ensure unique farm names per clinic
ALTER TABLE public.farm 
ADD CONSTRAINT IF NOT EXISTS unique_farm_name_per_clinic 
UNIQUE (clinic_id, farm_name);

-- Ensure unique campaign names per clinic
ALTER TABLE public.vaccination_campaign 
ADD CONSTRAINT IF NOT EXISTS unique_campaign_name_per_clinic 
UNIQUE (clinic_id, campaign_name);

-- ==============================================
-- CHECK CONSTRAINTS
-- ==============================================

-- Ensure positive amounts in payments
ALTER TABLE public.payments 
ADD CONSTRAINT IF NOT EXISTS check_payments_amount_positive 
CHECK (amount > 0);

-- Ensure positive price in price_services
ALTER TABLE public.price_services 
ADD CONSTRAINT IF NOT EXISTS check_price_services_price_positive 
CHECK (price >= 0);

-- Ensure positive animal count in farms
ALTER TABLE public.farm 
ADD CONSTRAINT IF NOT EXISTS check_farm_animal_count_positive 
CHECK (animal_count >= 0);

-- Ensure positive animals vaccinated in campaigns
ALTER TABLE public.vaccination_campaign 
ADD CONSTRAINT IF NOT EXISTS check_campaign_animals_vaccinated_positive 
CHECK (animals_vaccinated >= 0);

-- Ensure subscription dates are logical
ALTER TABLE public.subscription 
ADD CONSTRAINT IF NOT EXISTS check_subscription_dates_logical 
CHECK (endDate > startDate);

-- Ensure clinic dates are logical
ALTER TABLE public.clinique 
ADD CONSTRAINT IF NOT EXISTS check_clinic_dates_logical 
CHECK (endDate > startDate);

-- Ensure vaccination campaign dates are logical
ALTER TABLE public.vaccination_campaign 
ADD CONSTRAINT IF NOT EXISTS check_campaign_dates_logical 
CHECK (end_date > start_date);

-- Ensure appointment date is not in the past (allow same day)
ALTER TABLE public.rdv 
ADD CONSTRAINT IF NOT EXISTS check_rdv_date_not_past 
CHECK (date >= CURRENT_DATE);

-- Ensure positive subscription amount
ALTER TABLE public.subscription 
ADD CONSTRAINT IF NOT EXISTS check_subscription_amount_positive 
CHECK (amount > 0);

-- ==============================================
-- DOMAIN CONSTRAINTS
-- ==============================================

-- Create domain for email validation
CREATE DOMAIN IF NOT EXISTS email_address AS text
CHECK (VALUE ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

-- Create domain for phone number validation (flexible format)
CREATE DOMAIN IF NOT EXISTS phone_number AS text
CHECK (VALUE ~ '^[\+\d\s\-\(\)]{8,20}$');

-- ==============================================
-- INDEXES FOR CONSTRAINT PERFORMANCE
-- ==============================================

-- Create indexes to support foreign key constraints and improve query performance
-- These complement the indexes created in the main tables file

-- Compound indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_patient_clinic_species ON public.patient(clinic_id, species_category);
CREATE INDEX IF NOT EXISTS idx_payments_clinic_status ON public.payments(id_clinique, status);
CREATE INDEX IF NOT EXISTS idx_payments_date_status ON public.payments(payment_date, status);
CREATE INDEX IF NOT EXISTS idx_vaccination_patient_date ON public.vaccination(patient_id, created_at);
CREATE INDEX IF NOT EXISTS idx_clinical_case_patient_date ON public.clinical_case(patient_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_rdv_clinic_date ON public.rdv(clinic_id, date);
CREATE INDEX IF NOT EXISTS idx_subscription_owner_dates ON public.subscription(id_owner, startDate, endDate);

-- Partial indexes for common filtered queries
CREATE INDEX IF NOT EXISTS idx_payments_unpaid ON public.payments(id_clinique, payment_date) 
WHERE status IN ('pending', 'partial');

CREATE INDEX IF NOT EXISTS idx_rdv_upcoming ON public.rdv(clinic_id, date, time) 
WHERE done = false AND date >= CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_subscription_active ON public.subscription(id_clinique, endDate) 
WHERE endDate >= CURRENT_DATE;

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON CONSTRAINT fk_users_clinic_id ON public.users IS 'Links users to their assigned clinic';
COMMENT ON CONSTRAINT fk_patient_owner_id ON public.patient IS 'Links patients to their owners (clients)';
COMMENT ON CONSTRAINT unique_observation_case_number ON public.observation IS 'Ensures unique case numbers for observations';
COMMENT ON CONSTRAINT unique_farm_name_per_clinic ON public.farm IS 'Prevents duplicate farm names within same clinic';
COMMENT ON CONSTRAINT check_payments_amount_positive ON public.payments IS 'Ensures payment amounts are positive';
COMMENT ON CONSTRAINT check_subscription_dates_logical ON public.subscription IS 'Ensures subscription end date is after start date';
COMMENT ON CONSTRAINT check_rdv_date_not_past ON public.rdv IS 'Prevents scheduling appointments in the past';
