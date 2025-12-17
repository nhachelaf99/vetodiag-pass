-- Fix numeric field overflow by increasing precision of amount and total columns
-- This changes the columns to arbitrary precision NUMERIC.
-- We use 'USING column::numeric' to handle conversion if the current type is text/varchar.

DO $$ 
BEGIN
    -- Alter 'amount' column to NUMERIC if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'amount') THEN
        ALTER TABLE payments ALTER COLUMN amount TYPE NUMERIC USING amount::numeric;
    END IF;

    -- Alter 'total' column to NUMERIC if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'total') THEN
        ALTER TABLE payments ALTER COLUMN total TYPE NUMERIC USING total::numeric;
    END IF;
END $$;
