-- Animals table schema for Pashu Setu
CREATE TABLE IF NOT EXISTS animals (
  id SERIAL PRIMARY KEY,
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animals_owner_id ON animals(owner_id);
CREATE INDEX IF NOT EXISTS idx_animals_species ON animals(species);
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);