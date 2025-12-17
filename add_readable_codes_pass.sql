-- Add readable code columns to users and patient tables in VetoDiag Pass

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS user_code text UNIQUE;

ALTER TABLE public.patient 
ADD COLUMN IF NOT EXISTS patient_code text UNIQUE;

-- We will rely on application logic to populate these for now.
