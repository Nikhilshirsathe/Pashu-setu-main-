-- Complete Database Setup for Pashu Setu
-- Run these queries in your Supabase SQL editor

-- 1. Animals table with all required columns
CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  species VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  age INTEGER,
  weight DECIMAL(10,2),
  gender VARCHAR(20),
  tag_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'healthy',
  image_url TEXT,
  vaccination_status VARCHAR(100),
  microchip_id VARCHAR(100),
  owner_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Health records table
CREATE TABLE IF NOT EXISTS health_records (
  id SERIAL PRIMARY KEY,
  animal_id UUID REFERENCES animals(id),
  weight DECIMAL(10,2),
  symptoms TEXT,
  treatment TEXT,
  vaccination_record TEXT,
  medication TEXT,
  diagnosis TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  animal_id UUID REFERENCES animals(id),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Activities table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  animal_id UUID REFERENCES animals(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Consultation requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id SERIAL PRIMARY KEY,
  farmer_id VARCHAR(255) NOT NULL,
  veterinarian_id VARCHAR(255),
  animal_id UUID REFERENCES animals(id),
  request_type VARCHAR(50) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Maternity records table
CREATE TABLE IF NOT EXISTS maternity_records (
  id SERIAL PRIMARY KEY,
  animal_id UUID REFERENCES animals(id),
  breeding_date DATE NOT NULL,
  expected_delivery DATE NOT NULL,
  gestation_period VARCHAR(50),
  expected_litter_size VARCHAR(50),
  colostrum_notes TEXT,
  hygiene_checklist TEXT[],
  actual_delivery_date DATE,
  actual_litter_size INTEGER,
  delivery_notes TEXT,
  status VARCHAR(20) DEFAULT 'pregnant',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animals_owner_id ON animals(owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_species ON animals(species);
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_health_records_animal_id ON health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_farmer_id ON consultation_requests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_veterinarian_id ON consultation_requests(veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_maternity_animal_id ON maternity_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_maternity_status ON maternity_records(status);
CREATE INDEX IF NOT EXISTS idx_maternity_expected_delivery ON maternity_records(expected_delivery);

-- Enable Row Level Security (RLS) - Optional, can be disabled for testing
-- ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE maternity_records ENABLE ROW LEVEL SECURITY;