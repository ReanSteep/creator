-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_keys CASCADE;
DROP TABLE IF EXISTS chat_shared_keys CASCADE;
DROP TABLE IF EXISTS messages CASCADE;

-- Create user_keys table
CREATE TABLE IF NOT EXISTS public.user_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    public_key TEXT NOT NULL,
    encrypted_private_key TEXT NOT NULL,
    salt TEXT NOT NULL,
    nonce TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create chat_shared_keys table
CREATE TABLE IF NOT EXISTS public.chat_shared_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    encrypted_shared_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    encrypted_content TEXT NOT NULL,
    nonce TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_keys_user_id ON public.user_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_shared_keys_chat_id ON public.chat_shared_keys(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_shared_keys_user_id ON public.chat_shared_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);

-- Create unique constraints
ALTER TABLE public.user_keys ADD CONSTRAINT user_keys_user_id_key UNIQUE (user_id);
ALTER TABLE public.chat_shared_keys ADD CONSTRAINT chat_shared_keys_chat_id_user_id_key UNIQUE (chat_id, user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_shared_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own keys" ON user_keys;
DROP POLICY IF EXISTS "Users can insert their own keys" ON user_keys;
DROP POLICY IF EXISTS "Users can view their own chat keys" ON chat_shared_keys;
DROP POLICY IF EXISTS "Users can insert their own chat keys" ON chat_shared_keys;
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can insert messages they send" ON messages;

-- Create policies with proper auth.uid() casting
CREATE POLICY "Users can view their own keys"
    ON user_keys FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own keys"
    ON user_keys FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own chat keys"
    ON chat_shared_keys FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own chat keys"
    ON chat_shared_keys FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view messages they sent or received"
    ON messages FOR SELECT
    USING (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text);

CREATE POLICY "Users can insert messages they send"
    ON messages FOR INSERT
    WITH CHECK (auth.uid()::text = sender_id::text);

-- Grant necessary permissions to authenticated users
GRANT ALL ON user_keys TO authenticated;
GRANT ALL ON chat_shared_keys TO authenticated;
GRANT ALL ON messages TO authenticated; 