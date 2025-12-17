-- ==============================================
-- VetoDiag CRM Database Functions
-- ==============================================
-- This file contains all database functions for the VetoDiag CRM system
-- Run this after creating tables and buckets

-- ==============================================
-- USER MANAGEMENT FUNCTIONS
-- ==============================================

-- Function: delete_user_and_profile(uuid)
-- Deletes a user from auth.users (and cascades to public.users)
CREATE OR REPLACE FUNCTION public.delete_user_and_profile(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Function: create_user_profile()
-- Automatically creates a user profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    first_name, 
    last_name, 
    email, 
    role, 
    clinic_name, 
    phone, 
    clinic_id,
    status
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstName', NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastName', NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'worker'),
    COALESCE(NEW.raw_user_meta_data->>'clinicName', NEW.raw_user_meta_data->>'clinic_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'clinic_id')::uuid, NULL),
    COALESCE((NEW.raw_user_meta_data->>'status')::boolean, true)
  );
  RETURN NEW;
END;
$$;

-- Function: update_user_updated_at()
-- Updates the updated_at timestamp for any table
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ==============================================
-- CLINIC AND PATIENT FUNCTIONS
-- ==============================================

-- Function: get_clinic_stats(uuid)
-- Returns statistics for a specific clinic
CREATE OR REPLACE FUNCTION public.get_clinic_stats(clinic_uuid uuid)
RETURNS TABLE (
  patient_count bigint,
  appointment_count bigint,
  vaccination_count bigint,
  revenue_total numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.patient WHERE clinic_id = clinic_uuid),
    (SELECT COUNT(*) FROM public.rdv WHERE clinic_id = clinic_uuid),
    (SELECT COUNT(*) FROM public.vaccination WHERE clinic_id = clinic_uuid),
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE id_clinique = clinic_uuid AND status = 'paid');
END;
$$;

-- Function: get_patient_medical_history(uuid)
-- Returns complete medical history for a patient
CREATE OR REPLACE FUNCTION public.get_patient_medical_history(patient_uuid uuid)
RETURNS TABLE (
  record_type text,
  record_date timestamptz,
  description text,
  details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'vaccination'::text,
    v.created_at,
    v.vaccination_name,
    jsonb_build_object('next_time', v.next_time, 'lot_number', v.lot_number)
  FROM public.vaccination v
  WHERE v.patient_id = patient_uuid
  
  UNION ALL
  
  SELECT 
    'vermifugation'::text,
    vr.created_at,
    vr.name_product,
    jsonb_build_object('next_time', vr.next_time, 'dose', vr.dose)
  FROM public.vermifugation vr
  WHERE vr.patient_id = patient_uuid
  
  UNION ALL
  
  SELECT 
    'deparasitage'::text,
    d.treatment_date,
    d.product_name,
    jsonb_build_object('next_treatment', d.next_treatment, 'dosage', d.dosage, 'notes', d.notes)
  FROM public.deparasitage d
  WHERE d.patient_id = patient_uuid
  
  UNION ALL
  
  SELECT 
    'clinical_case'::text,
    cc.visit_date,
    cc.clinical_case_type,
    jsonb_build_object(
      'suspected_disease', cc.suspected_disease,
      'symptoms', cc.symptoms,
      'treatment_medical', cc.treatment_medical,
      'treatment_surgery', cc.treatment_surgery,
      'notes', cc.notes
    )
  FROM public.clinical_case cc
  WHERE cc.patient_id = patient_uuid
  
  ORDER BY record_date DESC;
END;
$$;

-- ==============================================
-- FINANCIAL FUNCTIONS
-- ==============================================

-- Function: calculate_clinic_revenue(uuid, date, date)
-- Calculates revenue for a clinic within a date range
CREATE OR REPLACE FUNCTION public.calculate_clinic_revenue(
  clinic_uuid uuid,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS TABLE (
  total_revenue numeric,
  paid_revenue numeric,
  pending_revenue numeric,
  payment_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_filter timestamptz;
  end_filter timestamptz;
BEGIN
  -- Set default date range if not provided
  start_filter := COALESCE(start_date::timestamptz, '1900-01-01'::timestamptz);
  end_filter := COALESCE(end_date::timestamptz, NOW());
  
  RETURN QUERY
  SELECT 
    COALESCE(SUM(amount), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_revenue,
    COALESCE(SUM(CASE WHEN status IN ('pending', 'partial') THEN amount ELSE 0 END), 0) as pending_revenue,
    COUNT(*) as payment_count
  FROM public.payments
  WHERE id_clinique = clinic_uuid
    AND payment_date >= start_filter
    AND payment_date <= end_filter;
END;
$$;

-- Function: get_monthly_revenue_stats(uuid, integer)
-- Returns monthly revenue statistics for a clinic for a given year
CREATE OR REPLACE FUNCTION public.get_monthly_revenue_stats(
  clinic_uuid uuid,
  year_param integer DEFAULT NULL
)
RETURNS TABLE (
  month_number integer,
  month_name text,
  total_amount numeric,
  payment_count bigint,
  avg_payment numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_year integer;
BEGIN
  target_year := COALESCE(year_param, EXTRACT(year FROM NOW())::integer);
  
  RETURN QUERY
  WITH months AS (
    SELECT generate_series(1, 12) as month_num
  )
  SELECT 
    m.month_num,
    to_char(make_date(target_year, m.month_num, 1), 'Month') as month_name,
    COALESCE(SUM(p.amount), 0) as total_amount,
    COUNT(p.id) as payment_count,
    COALESCE(AVG(p.amount), 0) as avg_payment
  FROM months m
  LEFT JOIN public.payments p ON 
    EXTRACT(month FROM p.payment_date) = m.month_num
    AND EXTRACT(year FROM p.payment_date) = target_year
    AND p.id_clinique = clinic_uuid
    AND p.status = 'paid'
  GROUP BY m.month_num
  ORDER BY m.month_num;
END;
$$;

-- ==============================================
-- APPOINTMENT AND SCHEDULING FUNCTIONS
-- ==============================================

-- Function: get_upcoming_appointments(uuid, integer)
-- Returns upcoming appointments for a clinic
CREATE OR REPLACE FUNCTION public.get_upcoming_appointments(
  clinic_uuid uuid,
  days_ahead integer DEFAULT 7
)
RETURNS TABLE (
  appointment_id uuid,
  appointment_date timestamptz,
  appointment_time time,
  patient_name text,
  patient_id uuid,
  appointment_type text,
  is_done boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.date,
    r.time,
    p.name,
    r.patient_id,
    r.type,
    r.done
  FROM public.rdv r
  LEFT JOIN public.patient p ON r.patient_id = p.id
  WHERE r.clinic_id = clinic_uuid
    AND r.date >= NOW()
    AND r.date <= (NOW() + (days_ahead || ' days')::interval)
    AND r.done = false
  ORDER BY r.date, r.time;
END;
$$;

-- ==============================================
-- FARM MANAGEMENT FUNCTIONS
-- ==============================================

-- Function: update_farm_visit(uuid, date)
-- Updates the last visit date for a farm
CREATE OR REPLACE FUNCTION public.update_farm_visit(
  farm_uuid uuid,
  visit_date date DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.farm
  SET last_visit = COALESCE(visit_date, CURRENT_DATE),
      updated_at = NOW()
  WHERE id = farm_uuid;
END;
$$;

-- ==============================================
-- SEARCH AND UTILITY FUNCTIONS
-- ==============================================

-- Function: search_patients(uuid, text)
-- Searches for patients in a clinic by name or owner name
CREATE OR REPLACE FUNCTION public.search_patients(
  clinic_uuid uuid,
  search_term text
)
RETURNS TABLE (
  patient_id uuid,
  patient_name text,
  owner_name text,
  species text,
  breed text,
  created_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.owner_name,
    p.species_category::text,
    p.breed,
    p.created_at
  FROM public.patient p
  WHERE p.clinic_id = clinic_uuid
    AND (
      p.name ILIKE '%' || search_term || '%'
      OR p.owner_name ILIKE '%' || search_term || '%'
      OR p.breed ILIKE '%' || search_term || '%'
    )
  ORDER BY p.name;
END;
$$;

-- Function: search_medicaments(text, integer, integer)
-- Searches for medicaments with pagination
CREATE OR REPLACE FUNCTION public.search_medicaments(
  search_term text DEFAULT '',
  page_limit integer DEFAULT 50,
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  medicament_id uuid,
  brand_name text,
  laboratory_name text,
  active_ingredients text,
  indications text,
  form_type text,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH search_results AS (
    SELECT 
      m.id,
      m.brand_name,
      m.laboratory_name,
      m.active_ingredients,
      m.indications,
      m.form_type,
      COUNT(*) OVER() as total_count
    FROM public.medicament m
    WHERE (search_term = '' OR (
      m.brand_name ILIKE '%' || search_term || '%'
      OR m.laboratory_name ILIKE '%' || search_term || '%'
      OR m.active_ingredients ILIKE '%' || search_term || '%'
      OR m.indications ILIKE '%' || search_term || '%'
    ))
    ORDER BY m.brand_name
    LIMIT page_limit
    OFFSET page_offset
  )
  SELECT * FROM search_results;
END;
$$;

-- ==============================================
-- DATA VALIDATION FUNCTIONS
-- ==============================================

-- Function: validate_clinic_access(uuid, uuid)
-- Validates if a user has access to a specific clinic
CREATE OR REPLACE FUNCTION public.validate_clinic_access(
  user_uuid uuid,
  clinic_uuid uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_clinic_id uuid;
  user_role_check user_role;
BEGIN
  SELECT clinic_id, role 
  INTO user_clinic_id, user_role_check
  FROM public.users 
  WHERE id = user_uuid;
  
  -- Admin users have access to all clinics
  IF user_role_check = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Regular users only have access to their own clinic
  RETURN user_clinic_id = clinic_uuid;
END;
$$;

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant specific permissions for certain functions
GRANT EXECUTE ON FUNCTION public.delete_user_and_profile(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO anon, authenticated;

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON FUNCTION public.delete_user_and_profile(uuid) IS 'Safely deletes a user and their profile data';
COMMENT ON FUNCTION public.create_user_profile() IS 'Trigger function to create user profile on auth user creation';
COMMENT ON FUNCTION public.update_updated_at() IS 'Generic trigger function to update updated_at timestamp';
COMMENT ON FUNCTION public.get_clinic_stats(uuid) IS 'Returns comprehensive statistics for a clinic';
COMMENT ON FUNCTION public.get_patient_medical_history(uuid) IS 'Returns complete medical history for a patient';
COMMENT ON FUNCTION public.calculate_clinic_revenue(uuid, date, date) IS 'Calculates revenue for a clinic within date range';
COMMENT ON FUNCTION public.get_monthly_revenue_stats(uuid, integer) IS 'Returns monthly revenue statistics for a clinic';
COMMENT ON FUNCTION public.get_upcoming_appointments(uuid, integer) IS 'Returns upcoming appointments for a clinic';
COMMENT ON FUNCTION public.update_farm_visit(uuid, date) IS 'Updates the last visit date for a farm';
COMMENT ON FUNCTION public.search_patients(uuid, text) IS 'Searches for patients by name or owner within a clinic';
COMMENT ON FUNCTION public.search_medicaments(text, integer, integer) IS 'Searches medicaments with pagination support';
COMMENT ON FUNCTION public.validate_clinic_access(uuid, uuid) IS 'Validates user access to specific clinic';
