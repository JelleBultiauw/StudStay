-- Create kots table
CREATE TABLE IF NOT EXISTS kots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kot_type TEXT NOT NULL,
  roommates TEXT NOT NULL,
  monthly_rent INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  available_now BOOLEAN DEFAULT false,
  furnished BOOLEAN DEFAULT false,
  private_bathroom BOOLEAN DEFAULT false,
  private_kitchen BOOLEAN DEFAULT false,
  room_size TEXT,
  bed_type TEXT,
  balcony BOOLEAN DEFAULT false,
  laundry_access TEXT,
  wifi_included BOOLEAN DEFAULT false,
  utilities_included TEXT,
  address TEXT NOT NULL,
  distance_to_university TEXT,
  floor TEXT,
  elevator BOOLEAN DEFAULT false,
  bike_storage BOOLEAN DEFAULT false,
  parking_spot BOOLEAN DEFAULT false,
  photos TEXT[],
  video_tour TEXT,
  virtual_tour TEXT,
  smoking_allowed BOOLEAN DEFAULT false,
  pets_allowed BOOLEAN DEFAULT false,
  preferred_tenant TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE kots ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read kots
CREATE POLICY "Allow public read access" ON kots
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own kots
CREATE POLICY "Allow authenticated users to insert" ON kots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own kots
CREATE POLICY "Allow users to update their own kots" ON kots
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own kots
CREATE POLICY "Allow users to delete their own kots" ON kots
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_kots_updated_at
  BEFORE UPDATE ON kots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 