-- Create consultation requests table
CREATE TABLE consultation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES auth.users(id) NOT NULL,
  veterinarian_id UUID REFERENCES auth.users(id),
  animal_id UUID REFERENCES animals(id),
  request_type VARCHAR(50) NOT NULL DEFAULT 'video_call',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  message TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own consultation requests" ON consultation_requests
  FOR SELECT USING (
    auth.uid() = farmer_id OR 
    auth.uid() = veterinarian_id
  );

CREATE POLICY "Farmers can create consultation requests" ON consultation_requests
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Users can update their own consultation requests" ON consultation_requests
  FOR UPDATE USING (
    auth.uid() = farmer_id OR 
    auth.uid() = veterinarian_id
  );