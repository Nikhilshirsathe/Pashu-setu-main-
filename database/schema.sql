-- Pashu Setu Database Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'doctor', 'volunteer', 'lab_employee')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS animals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  age INTEGER,
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_records (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animals(id),
  diagnosis TEXT,
  treatment TEXT,
  symptoms TEXT,
  vet_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES users(id),
  vet_id INTEGER REFERENCES users(id),
  animal_id INTEGER REFERENCES animals(id),
  status VARCHAR(50) DEFAULT 'pending',
  consultation_type VARCHAR(50) CHECK (consultation_type IN ('chat', 'video', 'emergency')),
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_samples (
  id SERIAL PRIMARY KEY,
  animal_id INTEGER REFERENCES animals(id),
  sample_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  pickup_address TEXT,
  lab_employee_id INTEGER REFERENCES users(id),
  results TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_requests (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES users(id),
  animal_id INTEGER REFERENCES animals(id),
  emergency_type VARCHAR(100) NOT NULL,
  location TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  assigned_volunteer_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);