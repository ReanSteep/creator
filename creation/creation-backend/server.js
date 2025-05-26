const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User session verification middleware
const verifyUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route example
app.get('/api/protected', verifyUser, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Server structure endpoints
app.post('/api/servers', verifyUser, async (req, res) => {
  const { name } = req.body;
  try {
    const { data, error } = await supabase
      .from('servers')
      .insert([
        { name, owner_id: req.user.id }
      ])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/servers', verifyUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('servers')
      .select(`
        *,
        folders:server_folders(
          id,
          name,
          position,
          tabs:server_tabs(*)
        ),
        tabs:server_tabs(*)
      `)
      .order('position');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/servers/:serverId/folders', verifyUser, async (req, res) => {
  const { name } = req.body;
  const { serverId } = req.params;
  
  try {
    // Get the current max position
    const { data: folders, error: foldersError } = await supabase
      .from('server_folders')
      .select('position')
      .eq('server_id', serverId)
      .order('position', { ascending: false })
      .limit(1);
    
    if (foldersError) throw foldersError;
    
    const position = folders.length > 0 ? folders[0].position + 1 : 0;
    
    const { data, error } = await supabase
      .from('server_folders')
      .insert([
        { name, server_id: serverId, position }
      ])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/servers/:serverId/tabs', verifyUser, async (req, res) => {
  const { name, folder_id } = req.body;
  const { serverId } = req.params;
  
  try {
    // Get the current max position for the folder or server
    const positionQuery = supabase
      .from('server_tabs')
      .select('position')
      .eq('server_id', serverId);
    
    if (folder_id) {
      positionQuery.eq('folder_id', folder_id);
    } else {
      positionQuery.is('folder_id', null);
    }
    
    const { data: tabs, error: tabsError } = await positionQuery
      .order('position', { ascending: false })
      .limit(1);
    
    if (tabsError) throw tabsError;
    
    const position = tabs.length > 0 ? tabs[0].position + 1 : 0;
    
    const { data, error } = await supabase
      .from('server_tabs')
      .insert([
        { 
          name, 
          server_id: serverId, 
          folder_id: folder_id || null,
          position 
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/servers/:serverId/folders/:folderId', verifyUser, async (req, res) => {
  const { name, position, expanded } = req.body;
  const { serverId, folderId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('server_folders')
      .update({ name, position, expanded })
      .eq('id', folderId)
      .eq('server_id', serverId)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/servers/:serverId/tabs/:tabId', verifyUser, async (req, res) => {
  const { name, position, folder_id } = req.body;
  const { serverId, tabId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('server_tabs')
      .update({ name, position, folder_id })
      .eq('id', tabId)
      .eq('server_id', serverId)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/servers/:serverId/folders/:folderId', verifyUser, async (req, res) => {
  const { serverId, folderId } = req.params;
  
  try {
    const { error } = await supabase
      .from('server_folders')
      .delete()
      .eq('id', folderId)
      .eq('server_id', serverId);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/servers/:serverId/tabs/:tabId', verifyUser, async (req, res) => {
  const { serverId, tabId } = req.params;
  
  try {
    const { error } = await supabase
      .from('server_tabs')
      .delete()
      .eq('id', tabId)
      .eq('server_id', serverId);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 