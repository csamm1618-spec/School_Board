-- Add email field to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN email TEXT;

-- Create index for faster email lookups
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
