-- Add 'client' role to the user_role enum type
-- This allows users who register via the patient portal to have a 'client' role

-- First, add the new value to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';

-- Add a comment to document the role
COMMENT ON TYPE user_role IS 'User roles: doctor (veterinarian), worker (clinic staff), admin (system administrator), client (pet owner/patient)';
