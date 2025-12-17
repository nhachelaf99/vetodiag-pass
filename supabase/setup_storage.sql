-- Enable the storage extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS "storage";

----------------------------------------------------------------
-- 1. IMAGES BUCKET SETUP
----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies for images to avoid conflicts
DROP POLICY IF EXISTS "Images Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Images Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Images Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Images Public Delete" ON storage.objects;

-- Create policies for images
CREATE POLICY "Images Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

CREATE POLICY "Images Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' );

CREATE POLICY "Images Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'images' );

CREATE POLICY "Images Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'images' );

----------------------------------------------------------------
-- 2. PATIENTS BUCKET SETUP (For Documents)
----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('patients', 'patients', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies for patients
DROP POLICY IF EXISTS "Patients Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Patients Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Patients Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Patients Public Delete" ON storage.objects;

-- Create policies for patients
-- ALLOW ALL operations for now to fix the issue. 
-- In production, you might want to restrict this to authenticated users only.
CREATE POLICY "Patients Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'patients' );

CREATE POLICY "Patients Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'patients' );

CREATE POLICY "Patients Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'patients' );

CREATE POLICY "Patients Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'patients' );
