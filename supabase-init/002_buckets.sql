-- ==============================================
-- VetoDiag CRM Storage Buckets Configuration
-- ==============================================
-- This file creates all storage buckets needed for the VetoDiag CRM system
-- Run this after creating the main tables

-- ==============================================
-- STORAGE BUCKETS
-- ==============================================

-- Create the 'patients' storage bucket for patient photos and documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('patients', 'patients', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'prescriptions' storage bucket for prescription documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'clinical-reports' storage bucket for medical reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinical-reports', 'clinical-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'vaccination-certificates' storage bucket for vaccination documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('vaccination-certificates', 'vaccination-certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'clinic-documents' storage bucket for clinic-related documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-documents', 'clinic-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'farm-documents' storage bucket for farm-related documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('farm-documents', 'farm-documents', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- STORAGE POLICIES
-- ==============================================

-- Enable RLS on storage objects
UPDATE storage.buckets SET public = true WHERE id IN ('patients', 'prescriptions', 'clinical-reports', 'vaccination-certificates', 'clinic-documents', 'farm-documents');

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view patient files from their clinic" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload patient files to their clinic" ON storage.objects;
DROP POLICY IF EXISTS "Users can update patient files from their clinic" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete patient files from their clinic" ON storage.objects;

-- Patients bucket policies - FIXED
CREATE POLICY "Users can view patient files from their clinic" ON storage.objects
FOR SELECT USING (
    bucket_id = 'patients' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND clinic_id IS NOT NULL
        AND (
            -- Path starts with user's clinic_id
            (storage.objects.name LIKE (clinic_id::text || '/%'))
            OR
            -- For backward compatibility, allow access to files in clinic folder
            (storage.objects.name LIKE ('%/' || clinic_id::text || '/%'))
        )
    )
);

CREATE POLICY "Users can upload patient files to their clinic" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'patients' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND clinic_id IS NOT NULL
        AND (
            -- Path starts with user's clinic_id
            (storage.objects.name LIKE (clinic_id::text || '/%'))
            OR
            -- For backward compatibility, allow upload to files in clinic folder
            (storage.objects.name LIKE ('%/' || clinic_id::text || '/%'))
        )
    )
);

CREATE POLICY "Users can update patient files from their clinic" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'patients' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND clinic_id IS NOT NULL
        AND (
            -- Path starts with user's clinic_id
            (storage.objects.name LIKE (clinic_id::text || '/%'))
            OR
            -- For backward compatibility, allow access to files in clinic folder
            (storage.objects.name LIKE ('%/' || clinic_id::text || '/%'))
        )
    )
);

CREATE POLICY "Users can delete patient files from their clinic" ON storage.objects
FOR DELETE USING (
    bucket_id = 'patients' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND clinic_id IS NOT NULL
        AND (
            -- Path starts with user's clinic_id
            (storage.objects.name LIKE (clinic_id::text || '/%'))
            OR
            -- For backward compatibility, allow access to files in clinic folder
            (storage.objects.name LIKE ('%/' || clinic_id::text || '/%'))
        )
    )
);

-- Alternative simpler approach - Allow all authenticated users (if the above is too restrictive)
-- Uncomment these and comment the above if needed
/*
CREATE POLICY "Allow authenticated users to view patient files" ON storage.objects
FOR SELECT USING (bucket_id = 'patients' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to upload patient files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'patients' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update patient files" ON storage.objects
FOR UPDATE USING (bucket_id = 'patients' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete patient files" ON storage.objects
FOR DELETE USING (bucket_id = 'patients' AND auth.uid() IS NOT NULL);
*/

-- Prescriptions bucket policies
DROP POLICY IF EXISTS "Users can view prescription files from their clinic" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload prescription files to their clinic" ON storage.objects;

CREATE POLICY "Users can view prescription files from their clinic" ON storage.objects
FOR SELECT USING (
    bucket_id = 'prescriptions' AND
    auth.uid() IS NOT NULL
);

CREATE POLICY "Users can upload prescription files to their clinic" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'prescriptions' AND
    auth.uid() IS NOT NULL
);

-- Clinical reports bucket policies
DROP POLICY IF EXISTS "Users can view clinical report files from their clinic" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload clinical report files to their clinic" ON storage.objects;

CREATE POLICY "Users can view clinical report files from their clinic" ON storage.objects
FOR SELECT USING (
    bucket_id = 'clinical-reports' AND
    auth.uid() IS NOT NULL
);

CREATE POLICY "Users can upload clinical report files to their clinic" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'clinical-reports' AND
    auth.uid() IS NOT NULL
);

-- Vaccination certificates bucket policies
DROP POLICY IF EXISTS "Users can view vaccination certificate files from their clinic" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload vaccination certificate files to their clinic" ON storage.objects;

CREATE POLICY "Users can view vaccination certificate files from their clinic" ON storage.objects
FOR SELECT USING (
    bucket_id = 'vaccination-certificates' AND
    auth.uid() IS NOT NULL
);

CREATE POLICY "Users can upload vaccination certificate files to their clinic" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'vaccination-certificates' AND
    auth.uid() IS NOT NULL
);

-- Clinic documents bucket policies
DROP POLICY IF EXISTS "Users can view clinic documents from their clinic" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can upload clinic documents to their clinic" ON storage.objects;

CREATE POLICY "Users can view clinic documents from their clinic" ON storage.objects
FOR SELECT USING (
    bucket_id = 'clinic-documents' AND
    auth.uid() IS NOT NULL
);

CREATE POLICY "Doctors can upload clinic documents to their clinic" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'clinic-documents' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'doctor'
    )
);

-- Farm documents bucket policies
DROP POLICY IF EXISTS "Users can view farm documents from their clinic" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload farm documents to their clinic" ON storage.objects;

CREATE POLICY "Users can view farm documents from their clinic" ON storage.objects
FOR SELECT USING (
    bucket_id = 'farm-documents' AND
    auth.uid() IS NOT NULL
);

CREATE POLICY "Users can upload farm documents to their clinic" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'farm-documents' AND
    auth.uid() IS NOT NULL
);

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON BUCKET patients IS 'Storage for patient photos and medical images';
COMMENT ON BUCKET prescriptions IS 'Storage for prescription documents and PDFs';
COMMENT ON BUCKET clinical-reports IS 'Storage for clinical reports and medical documents';
COMMENT ON BUCKET vaccination-certificates IS 'Storage for vaccination certificates and related documents';
COMMENT ON BUCKET clinic-documents IS 'Storage for clinic administrative documents';
COMMENT ON BUCKET farm-documents IS 'Storage for farm-related documents and reports';
