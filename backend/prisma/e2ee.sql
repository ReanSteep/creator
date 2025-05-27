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

-- Create chat_shared_keys table for storing encrypted shared keys
CREATE TABLE chat_shared_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL, -- This could be a UUID for a chat room or a combination of user IDs
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_shared_key TEXT NOT NULL, -- Encrypted with user's public key
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(chat_id, user_id)
);

-- Create messages table with encrypted content
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_chat_keys_chat ON chat_shared_keys(chat_id);
CREATE INDEX idx_chat_keys_user ON chat_shared_keys(user_id);

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
ALTER TABLE chat_shared_keys ENABLE ROW LEVEL SECURITY;

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

-- Create RLS Policies for chat_shared_keys
CREATE POLICY "Users can read their chat keys"
ON chat_shared_keys FOR SELECT
USING (auth.uid() = user_id);

-- Create RLS Policies for messages
CREATE POLICY "Users can read messages from their chats"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM chat_shared_keys
        WHERE chat_shared_keys.chat_id = messages.chat_id
        AND chat_shared_keys.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert messages to their chats"
ON messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_shared_keys
        WHERE chat_shared_keys.chat_id = messages.chat_id
        AND chat_shared_keys.user_id = auth.uid()
    )
    AND sender_id = auth.uid()
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