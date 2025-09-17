-- Add invite token and status fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN invite_token TEXT UNIQUE,
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
ADD COLUMN invited_by TEXT REFERENCES user_profiles(id),
ADD COLUMN invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster invite token lookups
CREATE INDEX idx_user_profiles_invite_token ON user_profiles(invite_token);

-- Create index for status filtering
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- Create index for invited_by filtering
CREATE INDEX idx_user_profiles_invited_by ON user_profiles(invited_by);
