-- Drop existing tables if they exist
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS tabs CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS user_keys CASCADE;
DROP TABLE IF EXISTS tab_shared_keys CASCADE;
DROP TABLE IF EXISTS tab_messages CASCADE;
DROP TABLE IF EXISTS file_metadata CASCADE;
DROP TABLE IF EXISTS plugin_configs CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid references auth.users on delete cascade,
  email text,
  primary key (id)
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- USER KEYS (E2EE)
CREATE TABLE user_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  encrypted_private_key BYTEA NOT NULL,
  key_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key_version)
);

-- FOLDERS (GROUPS/SERVERS)
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  encrypted_name BYTEA NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABS (CHANNELS/ROOMS)
CREATE TABLE tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encrypted_name BYTEA NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAB SHARED KEYS (E2EE KEY EXCHANGE)
CREATE TABLE tab_shared_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id UUID REFERENCES tabs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_key BYTEA NOT NULL,
  nonce BYTEA NOT NULL,
  sender_pub TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tab_id, user_id)
);

-- TAB MESSAGES (ENCRYPTED BLOBS)
CREATE TABLE tab_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id UUID REFERENCES tabs(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ciphertext BYTEA NOT NULL,
  nonce BYTEA NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLOCKS (DRAG-AND-DROP EDITOR)
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id UUID REFERENCES tabs(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  layout JSONB NOT NULL DEFAULT '{}',
  style JSONB NOT NULL DEFAULT '{}',
  encrypted_content BYTEA NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FILE METADATA (ENCRYPTED, MINIO)
CREATE TABLE file_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encrypted_name BYTEA NOT NULL,
  encrypted_key BYTEA NOT NULL,
  minio_path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tab_id UUID REFERENCES tabs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLUGIN CONFIGS
CREATE TABLE plugin_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  entry_point TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER SETTINGS
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  message_retention_days INTEGER,
  theme TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT true,
  encrypted_preferences BYTEA,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WORKSPACE MEMBERS
CREATE TABLE workspace_members (
  workspace_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  encrypted_metadata BYTEA,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Create additional indexes
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_blocks_tab_id ON blocks(tab_id);
CREATE INDEX idx_tabs_folder_id ON tabs(folder_id);
CREATE INDEX idx_files_tab_id ON file_metadata(tab_id);
CREATE INDEX idx_folders_owner ON folders(owner_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tab_shared_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE tab_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own messages"
    ON public.messages
    FOR SELECT
    USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can insert their own messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "Users manage own folders" ON folders FOR ALL TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users manage own tabs" ON tabs FOR ALL TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users manage own blocks" ON blocks FOR ALL TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users read/write their keys" ON user_keys FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users access their tab keys" ON tab_shared_keys FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users access their messages" ON tab_messages FOR ALL TO authenticated USING (
  sender_id = auth.uid() OR EXISTS (
    SELECT 1 FROM tab_shared_keys WHERE tab_id = tab_messages.tab_id AND user_id = auth.uid()
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON folders FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tabs_updated_at
BEFORE UPDATE ON tabs FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at
BEFORE UPDATE ON blocks FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_configs_updated_at
BEFORE UPDATE ON plugin_configs FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

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