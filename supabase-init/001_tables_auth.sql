-- ==============================================
-- VetoDiag CRM Database Schema - Main Tables
-- ==============================================
-- This file contains all main table definitions for the VetoDiag CRM system
-- Run this file first to create the core database structure

-- ==============================================
-- ENUMS AND TYPES
-- ==============================================

-- User roles enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('doctor', 'worker', 'admin');
    END IF;
END$$;

-- Species category enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'species_category') THEN
        CREATE TYPE species_category AS ENUM ('dog', 'cat', 'bird', 'reptile', 'rodent', 'other');
    END IF;
END$$;

-- Sex enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sex') THEN
        CREATE TYPE sex AS ENUM ('male', 'female');
    END IF;
END$$;

-- Procedure type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'procedure_type') THEN
        CREATE TYPE procedure_type AS ENUM ('surgery', 'medication', 'preventive_measure');
    END IF;
END$$;

-- Vaccination campaign status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vaccination_campaign_status') THEN
        CREATE TYPE vaccination_campaign_status AS ENUM ('Planifiée', 'En cours', 'Terminée', 'Annulée');
    END IF;
END$$;

-- Farm health status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'farm_health_status') THEN
        CREATE TYPE farm_health_status AS ENUM ('Excellent', 'Bon état', 'Préoccupant', 'Critique');
    END IF;
END$$;

-- ==============================================
-- CORE TABLES
-- ==============================================

-- Users table - Core user management
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    clinic_name text DEFAULT NULL,
    clinic_id uuid DEFAULT NULL, -- Will be linked to clinique table via foreign key
    phone text,
    status boolean DEFAULT FALSE,
    role user_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Clinique table - Veterinary clinic management
CREATE TABLE IF NOT EXISTS public.clinique (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    address text,
    region text,
    wilaya text,
    avnnumber text,
    latitude double precision,
    longitude double precision,
    startDate timestamptz NOT NULL,
    endDate timestamptz NOT NULL,
    receivables numeric DEFAULT 0,
    income numeric DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Client table - Pet owners
CREATE TABLE IF NOT EXISTS public.client (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    full_name text NOT NULL,
    address text,
    region text,
    telephone text,
    email text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Patient table - Animals/pets
CREATE TABLE IF NOT EXISTS public.patient (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    name text NOT NULL,
    owner_id uuid REFERENCES public.client(id) ON DELETE SET NULL,
    owner_name text,
    species_category species_category NOT NULL,
    date_of_birth date,
    sex sex NOT NULL,
    breed text,
    coat_color text,
    special_signs text,
    previous_pathologies text,
    pedigree text,
    tattoo_number text,
    rfid_nfc_id text,
    photo_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================
-- MEDICAL RECORDS TABLES
-- ==============================================

-- Vaccination table - Vaccination records
CREATE TABLE IF NOT EXISTS public.vaccination (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES public.patient(id) ON DELETE SET NULL,
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    vaccination_name text NOT NULL,
    next_time timestamptz,
    lot_number text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Vermifugation table - Deworming records
CREATE TABLE IF NOT EXISTS public.vermifugation (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES public.patient(id) ON DELETE SET NULL,
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    name_product text NOT NULL,
    next_time timestamptz,
    dose text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Deparasitage table - Parasite treatment records (missing from original SQL)
CREATE TABLE IF NOT EXISTS public.deparasitage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES public.patient(id) ON DELETE SET NULL,
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    treatment_date timestamptz NOT NULL DEFAULT now(),
    next_treatment timestamptz,
    dosage text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Clinical case table - Medical consultation records
CREATE TABLE IF NOT EXISTS public.clinical_case (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES public.patient(id) ON DELETE SET NULL,
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    visit_date timestamptz NOT NULL,
    clinical_case_type text DEFAULT 'Consultation',
    suspected_disease text,
    symptoms text[],
    additional_analysis text[], -- Array for: Hematology, Biochemistry, Serology, Urinalysis, Endocrinology
    lab_parameters jsonb, -- JSON object to store various lab parameters
    onset_of_symptoms_date date,
    onset_of_symptoms_days integer,
    treatment_medical text[],
    treatment_surgery text[],
    treatment_hospitalization text[],
    notes text,
    next_visit_date timestamptz,
    medical_report_printed boolean DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Observation table - Medical observation cases
CREATE TABLE IF NOT EXISTS public.observation (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    case_number text NOT NULL,
    animal_biting_scratching boolean DEFAULT FALSE,
    next_time date NOT NULL,
    patient_owner_info text,
    patient_name text,
    observation_visit_dates_notes jsonb, -- Array of objects: [{date, note}]
    result text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Patient documents table - Document and image storage for patients
CREATE TABLE IF NOT EXISTS public.patient_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES public.patient(id) ON DELETE CASCADE,
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    uploaded_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint,
    file_type text NOT NULL, -- MIME type (image/jpeg, application/pdf, etc.)
    document_category text DEFAULT 'general', -- general, xray, lab_results, reports, other
    is_image boolean DEFAULT FALSE, -- true for images (JPEG, PNG), false for documents
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================
-- APPOINTMENT AND SCHEDULING
-- ==============================================

-- RDV table - Appointments
CREATE TABLE IF NOT EXISTS public.rdv (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES public.patient(id) ON DELETE SET NULL,
    date timestamptz NOT NULL,
    time time NOT NULL,
    type text,
    owner_service text, -- Nullable, stores the service owner
    done boolean DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================
-- MEDICATION AND PRESCRIPTIONS
-- ==============================================

-- Medicament table - Drug/medication database
CREATE TABLE IF NOT EXISTS public.medicament (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name text NOT NULL,
    laboratory_name text,
    skus text,
    active_ingredients text,
    animal_category text,
    indications text,
    form_type text,
    atc_vet_code text,
    therapeutic_area text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Prescription table - Medical prescriptions
CREATE TABLE IF NOT EXISTS public.prescription (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES public.patient(id) ON DELETE SET NULL,
    patient_name text,
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    date timestamptz NOT NULL,
    veterinarian text,
    notes text,
    printed boolean DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Prescription medication table - Individual medications in prescriptions
CREATE TABLE IF NOT EXISTS public.prescription_medication (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id uuid REFERENCES public.prescription(id) ON DELETE CASCADE,
    name text NOT NULL,
    dosage text,
    frequency text,
    duration text,
    instructions text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================
-- ANIMAL PROCEDURES
-- ==============================================

-- Animal procedure parent table
CREATE TABLE IF NOT EXISTS public.animal_procedure (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date timestamptz NOT NULL,
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    species text NOT NULL,
    number_of_animals integer NOT NULL,
    description text,
    client_name text NOT NULL,
    phone text,
    type procedure_type NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Surgery details table
CREATE TABLE IF NOT EXISTS public.surgery_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    procedure_id uuid REFERENCES public.animal_procedure(id) ON DELETE CASCADE,
    type_of_surgery text,
    anesthesia_used text,
    complications_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Medication details table
CREATE TABLE IF NOT EXISTS public.medication_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    procedure_id uuid REFERENCES public.animal_procedure(id) ON DELETE CASCADE,
    product_medication text,
    dosage text,
    route_of_administration text,
    duration text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Preventive details table
CREATE TABLE IF NOT EXISTS public.preventive_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    procedure_id uuid REFERENCES public.animal_procedure(id) ON DELETE CASCADE,
    product_used text,
    action_type text,
    objective text,
    dosage text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================
-- VACCINATION CAMPAIGNS
-- ==============================================

-- Vaccination campaign table
CREATE TABLE IF NOT EXISTS public.vaccination_campaign (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name text NOT NULL,
    vaccine_type text NOT NULL,
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    location text NOT NULL,
    status vaccination_campaign_status NOT NULL DEFAULT 'Planifiée',
    animals_vaccinated integer DEFAULT 0,
    lot_number text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================
-- FARM MANAGEMENT
-- ==============================================

-- Farm table - Livestock farm management
CREATE TABLE IF NOT EXISTS public.farm (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    farm_name text NOT NULL,
    owner_name text NOT NULL,
    location text NOT NULL,
    animal_count integer NOT NULL DEFAULT 0,
    last_visit date,
    contact_phone text,
    contact_email text,
    farm_type text, -- Type of farm (cattle, sheep, poultry, etc.)
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Farm health records table
CREATE TABLE IF NOT EXISTS public.farm_health_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_farm uuid REFERENCES public.farm(id) ON DELETE CASCADE,
    health_status farm_health_status NOT NULL DEFAULT 'Bon état',
    vaccinations text[], -- Array of vaccination types
    recent_observations text[], -- Array of recent observations
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================
-- FINANCIAL MANAGEMENT
-- ==============================================

-- Price services table - Service pricing
CREATE TABLE IF NOT EXISTS public.price_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_clinique uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    catgory text, -- Note: keeping original typo for consistency
    status text,
    price numeric,
    titel text, -- Note: keeping original typo for consistency
    des text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Payments table - Payment tracking
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_date timestamptz NOT NULL,
    client_id uuid REFERENCES public.client(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES public.patient(id) ON DELETE SET NULL,
    service_id uuid REFERENCES public.price_services(id) ON DELETE SET NULL,
    id_clinique uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    amount numeric(10,2) NOT NULL,
    payment_method text CHECK (payment_method IN ('cash', 'card')),
    status text CHECK (status IN ('paid', 'pending', 'partial')) NOT NULL,
    notes text,
    total text,
    type_service text CHECK (type_service IN ('vaccination', 'deparasitage', 'certificats','consultation', 'observation', 'rural')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Subscription table - Subscription management
CREATE TABLE IF NOT EXISTS public.subscription (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_owner uuid REFERENCES public.users(id) ON DELETE CASCADE,
    startDate timestamptz NOT NULL,
    id_clinique uuid REFERENCES public.clinique(id) ON DELETE SET NULL,
    endDate timestamptz NOT NULL,
    type text NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Create search indexes for medicament table
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_medicament_brand_name ON public.medicament USING gin (brand_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicament_laboratory_name ON public.medicament USING gin (laboratory_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicament_active_ingredients ON public.medicament USING gin (active_ingredients gin_trgm_ops);

-- Create indexes for commonly queried foreign keys
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON public.users(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_clinic_id ON public.patient(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_owner_id ON public.patient(owner_id);
CREATE INDEX IF NOT EXISTS idx_client_clinic_id ON public.client(clinic_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_clinic_id ON public.vaccination(clinic_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_patient_id ON public.vaccination(patient_id);
CREATE INDEX IF NOT EXISTS idx_vermifugation_clinic_id ON public.vermifugation(clinic_id);
CREATE INDEX IF NOT EXISTS idx_vermifugation_patient_id ON public.vermifugation(patient_id);
CREATE INDEX IF NOT EXISTS idx_deparasitage_clinic_id ON public.deparasitage(clinic_id);
CREATE INDEX IF NOT EXISTS idx_deparasitage_patient_id ON public.deparasitage(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_case_clinic_id ON public.clinical_case(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinical_case_patient_id ON public.clinical_case(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_case_visit_date ON public.clinical_case(visit_date);
CREATE INDEX IF NOT EXISTS idx_observation_clinic_id ON public.observation(clinic_id);
CREATE INDEX IF NOT EXISTS idx_rdv_clinic_id ON public.rdv(clinic_id);
CREATE INDEX IF NOT EXISTS idx_rdv_patient_id ON public.rdv(patient_id);
CREATE INDEX IF NOT EXISTS idx_rdv_date ON public.rdv(date);
CREATE INDEX IF NOT EXISTS idx_prescription_clinic_id ON public.prescription(clinic_id);
CREATE INDEX IF NOT EXISTS idx_prescription_patient_id ON public.prescription(patient_id);
CREATE INDEX IF NOT EXISTS idx_animal_procedure_clinic_id ON public.animal_procedure(clinic_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_campaign_clinic_id ON public.vaccination_campaign(clinic_id);
CREATE INDEX IF NOT EXISTS idx_farm_clinic_id ON public.farm(clinic_id);
CREATE INDEX IF NOT EXISTS idx_farm_health_records_farm_id ON public.farm_health_records(id_farm);
CREATE INDEX IF NOT EXISTS idx_price_services_clinic_id ON public.price_services(id_clinique);
CREATE INDEX IF NOT EXISTS idx_payments_clinic_id ON public.payments(id_clinique);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_subscription_owner_id ON public.subscription(id_owner);
CREATE INDEX IF NOT EXISTS idx_subscription_clinic_id ON public.subscription(id_clinique);

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE public.users IS 'Core user management table storing doctors, workers, and admin users';
COMMENT ON TABLE public.clinique IS 'Veterinary clinic information and management';
COMMENT ON TABLE public.client IS 'Pet owners and clients of the veterinary clinics';
COMMENT ON TABLE public.patient IS 'Animals/pets managed by the veterinary clinics';
COMMENT ON TABLE public.vaccination IS 'Vaccination records for patients';
COMMENT ON TABLE public.vermifugation IS 'Deworming treatment records';
COMMENT ON TABLE public.deparasitage IS 'Parasite treatment records';
COMMENT ON TABLE public.clinical_case IS 'Medical consultation and case records';
COMMENT ON TABLE public.observation IS 'Medical observation cases for animal behavior monitoring';
COMMENT ON TABLE public.rdv IS 'Appointment scheduling system';
COMMENT ON TABLE public.medicament IS 'Drug and medication database';
COMMENT ON TABLE public.prescription IS 'Medical prescriptions issued by veterinarians';
COMMENT ON TABLE public.prescription_medication IS 'Individual medications within prescriptions';
COMMENT ON TABLE public.animal_procedure IS 'Parent table for various animal procedures';
COMMENT ON TABLE public.surgery_details IS 'Surgical procedure details';
COMMENT ON TABLE public.medication_details IS 'Medication procedure details';
COMMENT ON TABLE public.preventive_details IS 'Preventive measure procedure details';
COMMENT ON TABLE public.vaccination_campaign IS 'Vaccination campaign management';
COMMENT ON TABLE public.farm IS 'Livestock farm management';
COMMENT ON TABLE public.farm_health_records IS 'Health records for farms';
COMMENT ON TABLE public.price_services IS 'Service pricing management';
COMMENT ON TABLE public.payments IS 'Payment tracking and financial records';
COMMENT ON TABLE public.subscription IS 'Subscription management for clinic access';



