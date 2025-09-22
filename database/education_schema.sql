-- Educational Resources Table
CREATE TABLE IF NOT EXISTS educational_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Government Policies Table
CREATE TABLE IF NOT EXISTS government_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  effective_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample educational resources
INSERT INTO educational_resources (title, content, category, author) VALUES
('Cattle Vaccination Schedule', 'Complete guide to cattle vaccination including FMD, Anthrax, and seasonal vaccines. Follow proper timing for maximum effectiveness.', 'Health Management', 'Dr. Sharma'),
('Poultry Feed Management', 'Optimal feeding practices for broilers and layers. Includes nutritional requirements and feed conversion ratios.', 'Nutrition', 'Agricultural Extension'),
('Pig Housing Requirements', 'Essential guidelines for pig shelter construction, ventilation, and space requirements for different age groups.', 'Housing', 'Livestock Department'),
('Disease Prevention in Goats', 'Common diseases in goats and prevention strategies including PPR, pneumonia, and parasitic infections.', 'Health Management', 'Dr. Patel');

-- Insert sample government policies
INSERT INTO government_policies (title, content, policy_type, effective_date) VALUES
('Livestock Insurance Scheme 2024', 'New government insurance scheme covering cattle, buffalo, sheep, goat, and pig. Premium subsidy of 50% for farmers.', 'Insurance', '2024-01-01'),
('Animal Feed Quality Standards', 'Updated quality standards for commercial animal feed. Mandatory testing and certification requirements.', 'Quality Control', '2024-02-15'),
('Vaccination Subsidy Program', 'Free vaccination program for FMD, Anthrax, and PPR. Available at all government veterinary centers.', 'Health Program', '2024-03-01'),
('Organic Livestock Certification', 'Guidelines for organic livestock farming certification. Includes feed requirements and medication restrictions.', 'Certification', '2024-04-01');

-- Enable Row Level Security
ALTER TABLE educational_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_policies ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on educational_resources" ON educational_resources FOR SELECT USING (true);
CREATE POLICY "Allow public read access on government_policies" ON government_policies FOR SELECT USING (true);