-- Maternity records table
CREATE TABLE IF NOT EXISTS maternity_records (
  id SERIAL PRIMARY KEY,
  animal_id UUID REFERENCES animals(id),
  breeding_date DATE NOT NULL,
  expected_delivery DATE NOT NULL,
  gestation_period VARCHAR(50),
  expected_litter_size VARCHAR(50),
  colostrum_notes TEXT,
  hygiene_checklist TEXT[], -- Array of hygiene items checked
  actual_delivery_date DATE,
  actual_litter_size INTEGER,
  delivery_notes TEXT,
  status VARCHAR(20) DEFAULT 'pregnant', -- pregnant, delivered, complications
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_maternity_animal_id ON maternity_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_maternity_status ON maternity_records(status);
CREATE INDEX IF NOT EXISTS idx_maternity_expected_delivery ON maternity_records(expected_delivery);