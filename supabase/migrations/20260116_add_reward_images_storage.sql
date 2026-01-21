/*
  # Add Reward Images Storage Bucket

  ## Overview
  This migration creates a storage bucket for reward images and sets up appropriate
  policies for uploading, viewing, and managing reward images.

  ## Changes

  ### Storage Bucket
  - Creates `reward-images` bucket for storing reward images (JPEG, PNG)
  - Bucket is public for read access (rewards are visible to all authenticated users)
  
  ### Storage Policies
  - All authenticated users can view reward images
  - Only admins can upload, update, and delete reward images
  - Images are validated for correct MIME types (image/jpeg, image/png)

  ## Notes
  - Images are stored with reward ID as folder name for organization
  - Public URLs can be generated for displaying images in the UI
  - Maximum file size is enforced by Supabase default (50MB)
*/

-- Create the reward-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reward-images',
  'reward-images',
  true,
  5242880, -- 5MB limit for reward images
  ARRAY['image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy: Allow all authenticated users to view reward images
CREATE POLICY "Authenticated users can view reward images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reward-images');

-- Policy: Allow admins to upload reward images
CREATE POLICY "Admins can upload reward images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reward-images'
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'adm'
);

-- Policy: Allow admins to update reward images
CREATE POLICY "Admins can update reward images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'reward-images'
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'adm'
)
WITH CHECK (
  bucket_id = 'reward-images'
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'adm'
);

-- Policy: Allow admins to delete reward images
CREATE POLICY "Admins can delete reward images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reward-images'
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'adm'
);

-- Function to delete reward image when reward is deleted
CREATE OR REPLACE FUNCTION delete_reward_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the associated image from storage if it exists
  IF OLD.imagem_url IS NOT NULL AND OLD.imagem_url LIKE '%reward-images%' THEN
    -- Extract the file path from the URL
    PERFORM storage.delete('reward-images', 
      REPLACE(OLD.imagem_url, 
        (SELECT CONCAT(
          current_setting('app.settings.supabase_url', true), 
          '/storage/v1/object/public/reward-images/'
        )), 
        ''
      )
    );
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reward_deleted ON rewards;
CREATE TRIGGER on_reward_deleted
BEFORE DELETE ON rewards
FOR EACH ROW EXECUTE FUNCTION delete_reward_image();
