-- Add new columns to health_records table for detailed tracking
ALTER TABLE health_records 
ADD COLUMN IF NOT EXISTS last_vaccination_date DATE,
ADD COLUMN IF NOT EXISTS next_vaccination_due DATE,
ADD COLUMN IF NOT EXISTS vaccination_status VARCHAR(50) DEFAULT 'Up to date',
ADD COLUMN IF NOT EXISTS last_checkup_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS next_checkup_due DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS health_status VARCHAR(50) DEFAULT 'Healthy',
ADD COLUMN IF NOT EXISTS feeding_schedule TEXT,
ADD COLUMN IF NOT EXISTS special_notes TEXT;