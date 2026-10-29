ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prestasi_items jsonb DEFAULT '[]'::jsonb;
