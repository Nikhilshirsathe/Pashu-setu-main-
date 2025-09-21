-- Education Hub Database Schema

-- Educational Resources Table
CREATE TABLE educational_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'infographic', 'pdf')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  author TEXT NOT NULL,
  author_role TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Government Policies Table
CREATE TABLE government_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Draft', 'Archived')),
  impact TEXT NOT NULL CHECK (impact IN ('High', 'Medium', 'Low')),
  summary TEXT NOT NULL,
  content TEXT,
  pdf_url TEXT,
  effective_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Posts Table
CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  author_location TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments Table
CREATE TABLE post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes Table
CREATE TABLE resource_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES educational_resources(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource_id, user_id)
);

CREATE TABLE post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Insert sample data
INSERT INTO educational_resources (title, type, category, description, content, author, author_role, views, likes) VALUES
('Seasonal Disease Prevention in Cattle', 'article', 'Disease Prevention', 'Comprehensive guide on preventing common seasonal diseases in cattle', 'Detailed content about disease prevention...', 'Dr. Rajesh Kumar', 'Veterinarian', 1250, 89),
('Vaccination Schedule for Dairy Animals', 'video', 'Vaccination', 'Step-by-step video guide on proper vaccination schedules', 'Video content about vaccination...', 'Dr. Priya Sharma', 'Veterinarian', 2100, 156),
('Nutrition Management in Pregnancy', 'infographic', 'Nutrition', 'Visual guide on proper nutrition management for pregnant animals', 'Infographic content...', 'Animal Nutrition Team', 'Expert Team', 890, 67);

INSERT INTO government_policies (title, department, status, impact, summary, effective_date) VALUES
('New Animal Welfare Guidelines 2024', 'Ministry of Agriculture', 'Active', 'High', 'Updated guidelines for animal welfare standards in commercial farming operations.', '2024-01-20'),
('Livestock Insurance Scheme Updates', 'Department of Animal Husbandry', 'Active', 'Medium', 'Enhanced coverage and simplified claim process for livestock insurance schemes.', '2024-01-18'),
('Organic Farming Certification Process', 'Agricultural Standards Board', 'Draft', 'Medium', 'New streamlined process for obtaining organic farming certification.', '2024-02-01');

INSERT INTO community_posts (author_name, author_role, author_location, title, content, category, likes, comments_count) VALUES
('Ramesh Patel', 'Dairy Farmer', 'Gujarat', 'Successful Treatment of Mastitis Using Herbal Remedies', 'I want to share my experience treating mastitis in my dairy cows using traditional herbal remedies combined with modern veterinary care. This approach reduced treatment costs by 40% while maintaining effectiveness.', 'Experience Sharing', 45, 12),
('Dr. Meera Singh', 'Veterinarian', 'Punjab', 'Early Detection Signs of Foot and Mouth Disease', 'As we enter the monsoon season, I want to highlight the early warning signs of FMD that every farmer should watch for. Early detection can prevent widespread outbreaks.', 'Expert Advice', 78, 23),
('Suresh Kumar', 'Poultry Farmer', 'Tamil Nadu', 'Cost-Effective Feed Preparation for Broilers', 'Sharing my recipe for preparing nutritious and cost-effective feed for broiler chickens that has improved my profit margins by 25% over the past year.', 'Tips & Tricks', 34, 8);