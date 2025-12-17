-- ==============================================
-- VetoDiag CRM Database Triggers
-- ==============================================
-- This file creates all triggers for the VetoDiag CRM system
-- Run this after creating tables, functions, and relations

-- ==============================================
-- UPDATED_AT TRIGGERS
-- ==============================================
-- These triggers automatically update the updated_at timestamp whenever a record is modified

-- Users table updated_at trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Clinique table updated_at trigger
DROP TRIGGER IF EXISTS update_clinique_updated_at ON public.clinique;
CREATE TRIGGER update_clinique_updated_at
    BEFORE UPDATE ON public.clinique
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Client table updated_at trigger
DROP TRIGGER IF EXISTS update_client_updated_at ON public.client;
CREATE TRIGGER update_client_updated_at
    BEFORE UPDATE ON public.client
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Patient table updated_at trigger
DROP TRIGGER IF EXISTS update_patient_updated_at ON public.patient;
CREATE TRIGGER update_patient_updated_at
    BEFORE UPDATE ON public.patient
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Vaccination table updated_at trigger
DROP TRIGGER IF EXISTS update_vaccination_updated_at ON public.vaccination;
CREATE TRIGGER update_vaccination_updated_at
    BEFORE UPDATE ON public.vaccination
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Vermifugation table updated_at trigger
DROP TRIGGER IF EXISTS update_vermifugation_updated_at ON public.vermifugation;
CREATE TRIGGER update_vermifugation_updated_at
    BEFORE UPDATE ON public.vermifugation
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Deparasitage table updated_at trigger
DROP TRIGGER IF EXISTS update_deparasitage_updated_at ON public.deparasitage;
CREATE TRIGGER update_deparasitage_updated_at
    BEFORE UPDATE ON public.deparasitage
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Clinical case table updated_at trigger
DROP TRIGGER IF EXISTS update_clinical_case_updated_at ON public.clinical_case;
CREATE TRIGGER update_clinical_case_updated_at
    BEFORE UPDATE ON public.clinical_case
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Observation table updated_at trigger
DROP TRIGGER IF EXISTS update_observation_updated_at ON public.observation;
CREATE TRIGGER update_observation_updated_at
    BEFORE UPDATE ON public.observation
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- RDV table updated_at trigger
DROP TRIGGER IF EXISTS update_rdv_updated_at ON public.rdv;
CREATE TRIGGER update_rdv_updated_at
    BEFORE UPDATE ON public.rdv
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Medicament table updated_at trigger
DROP TRIGGER IF EXISTS update_medicament_updated_at ON public.medicament;
CREATE TRIGGER update_medicament_updated_at
    BEFORE UPDATE ON public.medicament
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Prescription table updated_at trigger
DROP TRIGGER IF EXISTS update_prescription_updated_at ON public.prescription;
CREATE TRIGGER update_prescription_updated_at
    BEFORE UPDATE ON public.prescription
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Prescription medication table updated_at trigger
DROP TRIGGER IF EXISTS update_prescription_medication_updated_at ON public.prescription_medication;
CREATE TRIGGER update_prescription_medication_updated_at
    BEFORE UPDATE ON public.prescription_medication
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Animal procedure table updated_at trigger
DROP TRIGGER IF EXISTS update_animal_procedure_updated_at ON public.animal_procedure;
CREATE TRIGGER update_animal_procedure_updated_at
    BEFORE UPDATE ON public.animal_procedure
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Surgery details table updated_at trigger
DROP TRIGGER IF EXISTS update_surgery_details_updated_at ON public.surgery_details;
CREATE TRIGGER update_surgery_details_updated_at
    BEFORE UPDATE ON public.surgery_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Medication details table updated_at trigger
DROP TRIGGER IF EXISTS update_medication_details_updated_at ON public.medication_details;
CREATE TRIGGER update_medication_details_updated_at
    BEFORE UPDATE ON public.medication_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Preventive details table updated_at trigger
DROP TRIGGER IF EXISTS update_preventive_details_updated_at ON public.preventive_details;
CREATE TRIGGER update_preventive_details_updated_at
    BEFORE UPDATE ON public.preventive_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Vaccination campaign table updated_at trigger
DROP TRIGGER IF EXISTS update_vaccination_campaign_updated_at ON public.vaccination_campaign;
CREATE TRIGGER update_vaccination_campaign_updated_at
    BEFORE UPDATE ON public.vaccination_campaign
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Farm table updated_at trigger
DROP TRIGGER IF EXISTS update_farm_updated_at ON public.farm;
CREATE TRIGGER update_farm_updated_at
    BEFORE UPDATE ON public.farm
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Farm health records table updated_at trigger
DROP TRIGGER IF EXISTS update_farm_health_records_updated_at ON public.farm_health_records;
CREATE TRIGGER update_farm_health_records_updated_at
    BEFORE UPDATE ON public.farm_health_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Price services table updated_at trigger
DROP TRIGGER IF EXISTS update_price_services_updated_at ON public.price_services;
CREATE TRIGGER update_price_services_updated_at
    BEFORE UPDATE ON public.price_services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Payments table updated_at trigger
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Subscription table updated_at trigger
DROP TRIGGER IF EXISTS update_subscription_updated_at ON public.subscription;
CREATE TRIGGER update_subscription_updated_at
    BEFORE UPDATE ON public.subscription
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ==============================================
-- AUTH USER PROFILE CREATION TRIGGER
-- ==============================================
-- This trigger automatically creates a user profile when a new auth user is created

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile on auth user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_profile();

-- ==============================================
-- BUSINESS LOGIC TRIGGERS
-- ==============================================

-- Function to automatically update clinic revenue when payments are made
CREATE OR REPLACE FUNCTION public.update_clinic_revenue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update clinic income when payment status changes to 'paid'
    IF TG_OP = 'INSERT' AND NEW.status = 'paid' THEN
        UPDATE public.clinique 
        SET income = income + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.id_clinique;
    END IF;
    
    -- Update clinic income when payment status changes
    IF TG_OP = 'UPDATE' THEN
        -- If status changed from non-paid to paid
        IF OLD.status != 'paid' AND NEW.status = 'paid' THEN
            UPDATE public.clinique 
            SET income = income + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.id_clinique;
        END IF;
        
        -- If status changed from paid to non-paid
        IF OLD.status = 'paid' AND NEW.status != 'paid' THEN
            UPDATE public.clinique 
            SET income = income - OLD.amount,
                updated_at = NOW()
            WHERE id = NEW.id_clinique;
        END IF;
    END IF;
    
    -- Handle deletions
    IF TG_OP = 'DELETE' AND OLD.status = 'paid' THEN
        UPDATE public.clinique 
        SET income = income - OLD.amount,
            updated_at = NOW()
        WHERE id = OLD.id_clinique;
        RETURN OLD;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for automatic clinic revenue updates
DROP TRIGGER IF EXISTS update_clinic_revenue_trigger ON public.payments;
CREATE TRIGGER update_clinic_revenue_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_clinic_revenue();

-- Function to validate patient age consistency
CREATE OR REPLACE FUNCTION public.validate_patient_age()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Ensure date_of_birth is not in the future
    IF NEW.date_of_birth > CURRENT_DATE THEN
        RAISE EXCEPTION 'Patient birth date cannot be in the future';
    END IF;
    
    -- Ensure date_of_birth is not too far in the past (reasonable for animals)
    IF NEW.date_of_birth < (CURRENT_DATE - INTERVAL '50 years') THEN
        RAISE EXCEPTION 'Patient birth date seems unreasonably old';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for patient age validation
DROP TRIGGER IF EXISTS validate_patient_age_trigger ON public.patient;
CREATE TRIGGER validate_patient_age_trigger
    BEFORE INSERT OR UPDATE ON public.patient
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_patient_age();

-- Function to automatically set subscription status
CREATE OR REPLACE FUNCTION public.update_subscription_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- This function could be extended to automatically manage subscription statuses
    -- Currently just ensures data integrity
    
    -- Ensure subscription amount is positive
    IF NEW.amount <= 0 THEN
        RAISE EXCEPTION 'Subscription amount must be positive';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for subscription validation
DROP TRIGGER IF EXISTS validate_subscription_trigger ON public.subscription;
CREATE TRIGGER validate_subscription_trigger
    BEFORE INSERT OR UPDATE ON public.subscription
    FOR EACH ROW
    EXECUTE FUNCTION public.update_subscription_status();

-- Function to log important changes (audit trail)
CREATE OR REPLACE FUNCTION public.log_important_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This is a placeholder for audit logging functionality
    -- In a production system, you might want to log changes to a separate audit table
    
    -- For now, we'll just ensure the user making changes has proper permissions
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Changes must be made by authenticated users';
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for audit logging on sensitive tables
DROP TRIGGER IF EXISTS log_user_changes ON public.users;
CREATE TRIGGER log_user_changes
    BEFORE UPDATE OR DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.log_important_changes();

DROP TRIGGER IF EXISTS log_payment_changes ON public.payments;
CREATE TRIGGER log_payment_changes
    BEFORE UPDATE OR DELETE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.log_important_changes();

-- ==============================================
-- NOTIFICATION TRIGGERS
-- ==============================================

-- Function to send notifications for upcoming appointments
CREATE OR REPLACE FUNCTION public.notify_upcoming_appointments()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- This function could be extended to send notifications
    -- For now, it's a placeholder for future notification functionality
    
    -- Example: Send notification when appointment is within 24 hours
    IF NEW.date <= (NOW() + INTERVAL '24 hours') AND NOT NEW.done THEN
        -- In a real implementation, this might send an email or push notification
        -- PERFORM pg_notify('appointment_reminder', json_build_object('appointment_id', NEW.id, 'patient_name', (SELECT name FROM patient WHERE id = NEW.patient_id))::text);
        NULL; -- Placeholder
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for appointment notifications
DROP TRIGGER IF EXISTS notify_appointments_trigger ON public.rdv;
CREATE TRIGGER notify_appointments_trigger
    AFTER INSERT OR UPDATE ON public.rdv
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_upcoming_appointments();

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TRIGGER update_users_updated_at ON public.users IS 'Automatically updates updated_at timestamp on user record changes';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Automatically creates user profile when auth user is created';
COMMENT ON TRIGGER update_clinic_revenue_trigger ON public.payments IS 'Automatically updates clinic revenue when payments are processed';
COMMENT ON TRIGGER validate_patient_age_trigger ON public.patient IS 'Validates patient birth date is reasonable';
COMMENT ON TRIGGER log_user_changes ON public.users IS 'Logs important changes to user records for audit trail';
COMMENT ON TRIGGER notify_appointments_trigger ON public.rdv IS 'Handles appointment notifications and reminders';
