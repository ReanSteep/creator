BEGIN;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_keys CASCADE;
DROP TABLE IF EXISTS chat_shared_keys CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id uuid references auth.users on delete cascade,
    email text,
    primary key (id)
);

-- Create user_keys table for storing public/private key pairs
CREATE TABLE user_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    public_key TEXT NOT NULL,
    encrypted_private_key TEXT NOT NULL, -- Encrypted with user's password
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Create messages table with both plaintext and encrypted content
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- Plaintext content for current implementation
    encrypted_content TEXT, -- For future E2EE implementation
    chat_id UUID, -- For future E2EE implementation
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for profiles
CREATE POLICY "Enable read access for all users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for anonymous users"
ON profiles FOR SELECT
TO anon
USING (true);

-- Create RLS Policies for user_keys
CREATE POLICY "Users can read their own keys"
ON user_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own keys"
ON user_keys FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS Policies for messages
CREATE POLICY "Users can read their own messages"
ON messages FOR SELECT
USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
);

CREATE POLICY "Users can insert messages"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
);

-- Create new user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql security definer;

-- Create new user trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to create profiles for existing users
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    FOR auth_user IN SELECT id, email FROM auth.users
    LOOP
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth_user.id) THEN
            INSERT INTO profiles (id, email)
            VALUES (auth_user.id, auth_user.email);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create profiles for existing users
SELECT create_missing_profiles();

COMMIT; 