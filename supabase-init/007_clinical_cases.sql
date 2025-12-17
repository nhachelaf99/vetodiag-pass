-- ==============================================
-- VetoDiag CRM Clinical Cases Extensions
-- ==============================================
-- This file contains additional functionality specific to clinical cases
-- The main clinical_case table is defined in 001_tables_auth.sql
-- Run this after the main schema files for extended clinical case functionality

-- ==============================================
-- CLINICAL CASE VIEWS
-- ==============================================

-- Create a comprehensive view for clinical cases with patient information
CREATE OR REPLACE VIEW public.clinical_case_detailed AS
SELECT 
    cc.id,
    cc.visit_date,
    cc.clinical_case_type,
    cc.suspected_disease,
    cc.symptoms,
    cc.additional_analysis,
    cc.lab_parameters,
    cc.onset_of_symptoms_date,
    cc.onset_of_symptoms_days,
    cc.treatment_medical,
    cc.treatment_surgery,
    cc.treatment_hospitalization,
    cc.notes,
    cc.next_visit_date,
    cc.medical_report_printed,
    cc.created_at,
    cc.updated_at,
    -- Patient information
    p.name as patient_name,
    p.owner_name as patient_owner,
    p.species_category,
    p.breed,
    p.date_of_birth as patient_birth_date,
    -- Clinic information
    c.name as clinic_name,
    -- Client information
    cl.full_name as client_name,
    cl.telephone as client_phone,
    cl.email as client_email
FROM public.clinical_case cc
LEFT JOIN public.patient p ON cc.patient_id = p.id
LEFT JOIN public.clinique c ON cc.clinic_id = c.id
LEFT JOIN public.client cl ON p.owner_id = cl.id;

-- Create a view for recent clinical cases (last 30 days)
CREATE OR REPLACE VIEW public.recent_clinical_cases AS
SELECT *
FROM public.clinical_case_detailed
WHERE visit_date >= (CURRENT_DATE - INTERVAL '30 days')
ORDER BY visit_date DESC;

-- Create a view for follow-up appointments needed
CREATE OR REPLACE VIEW public.clinical_cases_followup AS
SELECT 
    id,
    patient_name,
    patient_owner,
    clinic_name,
    suspected_disease,
    visit_date,
    next_visit_date,
    CASE 
        WHEN next_visit_date < CURRENT_DATE THEN 'Overdue'
        WHEN next_visit_date <= (CURRENT_DATE + INTERVAL '7 days') THEN 'Due Soon'
        ELSE 'Scheduled'
    END as followup_status
FROM public.clinical_case_detailed
WHERE next_visit_date IS NOT NULL
    AND next_visit_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY next_visit_date ASC;

-- ==============================================
-- CLINICAL CASE FUNCTIONS
-- ==============================================

-- Function to get case summary statistics for a clinic
CREATE OR REPLACE FUNCTION public.get_clinic_case_statistics(
    clinic_uuid uuid,
    start_date date DEFAULT NULL,
    end_date date DEFAULT NULL
)
RETURNS TABLE (
    total_cases bigint,
    cases_this_month bigint,
    most_common_disease text,
    avg_cases_per_day numeric,
    pending_followups bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_filter date;
    end_filter date;
BEGIN
    -- Set default date range if not provided
    start_filter := COALESCE(start_date, CURRENT_DATE - INTERVAL '1 year');
    end_filter := COALESCE(end_date, CURRENT_DATE);
    
    RETURN QUERY
    WITH case_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE visit_date >= date_trunc('month', CURRENT_DATE)) as this_month,
            COUNT(*) FILTER (WHERE next_visit_date IS NOT NULL AND next_visit_date >= CURRENT_DATE) as followups
        FROM public.clinical_case 
        WHERE clinic_id = clinic_uuid 
            AND visit_date >= start_filter 
            AND visit_date <= end_filter
    ),
    disease_stats AS (
        SELECT suspected_disease, COUNT(*) as disease_count
        FROM public.clinical_case 
        WHERE clinic_id = clinic_uuid 
            AND visit_date >= start_filter 
            AND visit_date <= end_filter
            AND suspected_disease IS NOT NULL
        GROUP BY suspected_disease
        ORDER BY disease_count DESC
        LIMIT 1
    )
    SELECT 
        cs.total,
        cs.this_month,
        COALESCE(ds.suspected_disease, 'No data') as most_common_disease,
        ROUND(cs.total::numeric / GREATEST(1, (end_filter - start_filter)::integer), 2) as avg_cases_per_day,
        cs.followups
    FROM case_stats cs
    LEFT JOIN disease_stats ds ON true;
END;
$$;

-- Function to search clinical cases by symptoms or disease
CREATE OR REPLACE FUNCTION public.search_clinical_cases(
    clinic_uuid uuid,
    search_term text,
    limit_results integer DEFAULT 50
)
RETURNS TABLE (
    case_id uuid,
    patient_name text,
    visit_date timestamptz,
    suspected_disease text,
    symptoms text[],
    relevance_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id,
        p.name,
        cc.visit_date,
        cc.suspected_disease,
        cc.symptoms,
        -- Simple relevance scoring
        CASE 
            WHEN cc.suspected_disease ILIKE '%' || search_term || '%' THEN 3
            WHEN array_to_string(cc.symptoms, ' ') ILIKE '%' || search_term || '%' THEN 2
            WHEN cc.notes ILIKE '%' || search_term || '%' THEN 1
            ELSE 0
        END as relevance_score
    FROM public.clinical_case cc
    LEFT JOIN public.patient p ON cc.patient_id = p.id
    WHERE cc.clinic_id = clinic_uuid
        AND (
            cc.suspected_disease ILIKE '%' || search_term || '%'
            OR array_to_string(cc.symptoms, ' ') ILIKE '%' || search_term || '%'
            OR cc.notes ILIKE '%' || search_term || '%'
        )
    ORDER BY relevance_score DESC, cc.visit_date DESC
    LIMIT limit_results;
END;
$$;

-- Function to generate medical report summary
CREATE OR REPLACE FUNCTION public.generate_case_report_summary(
    case_uuid uuid
)
RETURNS TABLE (
    report_summary text,
    patient_info text,
    case_timeline text,
    recommendations text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    case_record record;
    patient_record record;
BEGIN
    -- Get case and patient information
    SELECT cc.*, p.name as patient_name, p.owner_name, p.species_category, p.breed
    INTO case_record
    FROM public.clinical_case cc
    LEFT JOIN public.patient p ON cc.patient_id = p.id
    WHERE cc.id = case_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Clinical case not found';
    END IF;
    
    RETURN QUERY
    SELECT 
        -- Report summary
        CONCAT(
            'Clinical Case Report for ', case_record.patient_name, 
            ' - ', case_record.clinical_case_type, 
            ' on ', to_char(case_record.visit_date, 'DD/MM/YYYY')
        ) as report_summary,
        
        -- Patient info
        CONCAT(
            'Patient: ', case_record.patient_name, E'\n',
            'Owner: ', case_record.owner_name, E'\n',
            'Species: ', case_record.species_category, E'\n',
            'Breed: ', COALESCE(case_record.breed, 'Not specified')
        ) as patient_info,
        
        -- Case timeline
        CONCAT(
            'Visit Date: ', to_char(case_record.visit_date, 'DD/MM/YYYY'), E'\n',
            'Suspected Disease: ', COALESCE(case_record.suspected_disease, 'Not specified'), E'\n',
            'Symptoms: ', COALESCE(array_to_string(case_record.symptoms, ', '), 'None recorded'), E'\n',
            'Next Visit: ', COALESCE(to_char(case_record.next_visit_date, 'DD/MM/YYYY'), 'Not scheduled')
        ) as case_timeline,
        
        -- Recommendations
        CONCAT(
            'Medical Treatment: ', COALESCE(array_to_string(case_record.treatment_medical, ', '), 'None'), E'\n',
            'Surgical Treatment: ', COALESCE(array_to_string(case_record.treatment_surgery, ', '), 'None'), E'\n',
            'Hospitalization: ', COALESCE(array_to_string(case_record.treatment_hospitalization, ', '), 'None'), E'\n',
            'Notes: ', COALESCE(case_record.notes, 'No additional notes')
        ) as recommendations;
END;
$$;

-- ==============================================
-- CLINICAL CASE TRIGGERS
-- ==============================================

-- Function to automatically schedule follow-up appointments
CREATE OR REPLACE FUNCTION public.auto_schedule_followup()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- If a next visit date is set and no corresponding appointment exists, suggest creating one
    IF NEW.next_visit_date IS NOT NULL AND NEW.next_visit_date != OLD.next_visit_date THEN
        -- Insert a suggested appointment (you might want to modify this based on your needs)
        INSERT INTO public.rdv (clinic_id, patient_id, date, time, type, done)
        VALUES (
            NEW.clinic_id,
            NEW.patient_id,
            NEW.next_visit_date,
            '09:00:00', -- Default time
            'Follow-up Consultation',
            false
        )
        ON CONFLICT DO NOTHING; -- Avoid duplicates if appointment already exists
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic follow-up scheduling
DROP TRIGGER IF EXISTS auto_schedule_followup_trigger ON public.clinical_case;
CREATE TRIGGER auto_schedule_followup_trigger
    AFTER UPDATE ON public.clinical_case
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_schedule_followup();

-- ==============================================
-- CLINICAL CASE INDEXES
-- ==============================================

-- Additional indexes for clinical case performance
CREATE INDEX IF NOT EXISTS idx_clinical_case_suspected_disease ON public.clinical_case(suspected_disease);
CREATE INDEX IF NOT EXISTS idx_clinical_case_symptoms_gin ON public.clinical_case USING gin(symptoms);
CREATE INDEX IF NOT EXISTS idx_clinical_case_next_visit ON public.clinical_case(next_visit_date) WHERE next_visit_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clinical_case_type_date ON public.clinical_case(clinical_case_type, visit_date);

-- Text search index for notes
CREATE INDEX IF NOT EXISTS idx_clinical_case_notes_search ON public.clinical_case USING gin(to_tsvector('english', notes));

-- ==============================================
-- VIEW PERMISSIONS
-- ==============================================

-- Grant permissions on views to authenticated users
GRANT SELECT ON public.clinical_case_detailed TO authenticated;
GRANT SELECT ON public.recent_clinical_cases TO authenticated;
GRANT SELECT ON public.clinical_cases_followup TO authenticated;

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON VIEW public.clinical_case_detailed IS 'Comprehensive view of clinical cases with patient and clinic information';
COMMENT ON VIEW public.recent_clinical_cases IS 'Clinical cases from the last 30 days for quick access';
COMMENT ON VIEW public.clinical_cases_followup IS 'Cases requiring follow-up with status indicators';
COMMENT ON FUNCTION public.get_clinic_case_statistics(uuid, date, date) IS 'Returns statistical summary of clinical cases for a clinic';
COMMENT ON FUNCTION public.search_clinical_cases(uuid, text, integer) IS 'Searches clinical cases by symptoms, disease, or notes with relevance scoring';
COMMENT ON FUNCTION public.generate_case_report_summary(uuid) IS 'Generates a formatted medical report summary for a clinical case';
COMMENT ON TRIGGER auto_schedule_followup_trigger ON public.clinical_case IS 'Automatically creates follow-up appointments when next visit date is set'; 