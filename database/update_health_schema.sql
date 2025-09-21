-- Add new columns to health_records table for comprehensive tracking
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS last_vaccination_date DATE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS next_vaccination_due DATE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS vaccination_status VARCHAR(50) DEFAULT 'Up to date';
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS health_status VARCHAR(50) DEFAULT 'Healthy';
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS feeding_schedule TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS special_notes TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS last_medication_date DATE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS last_checkup_date DATE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS next_checkup_due DATE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS last_feeding_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS breeding_status VARCHAR(50);
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS pregnancy_status TEXT;