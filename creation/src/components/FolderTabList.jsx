import { useParams, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export default function FolderTabList() {
  const { serverId, tabId } = useParams();
  const location = useLocation();
  
  const [serverData, setServerData] = useState(null);
  const [draggedTab, setDraggedTab] = useState(null);
  const [draggedFolder, setDraggedFolder] = useState(null);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [showTabInput, setShowTabInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newTabName, setNewTabName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch server data when serverId changes
  useEffect(() => {
    if (serverId) {
      fetchServerData();
    }
  }, [serverId]);

  const fetchServerData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServerData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch server data");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/servers/${serverId}/folders`,
        { name: newFolderName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setServerData(prev => ({
        ...prev,
        folders: [...prev.folders, { ...response.data, tabs: [] }]
      }));
      setNewFolderName("");
      setShowFolderInput(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create folder");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  // Create tab
  const handleCreateTab = async () => {
    if (!newTabName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/servers/${serverId}/tabs`,
        { name: newTabName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setServerData(prev => ({
        ...prev,
        tabs: [...prev.tabs, response.data]
      }));
      setNewTabName("");
      setShowTabInput(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create tab");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  // Toggle folder expanded state
  const toggleFolder = async (folderId) => {
    try {
      const token = localStorage.getItem("token");
      const folder = serverData.folders.find(f => f.id === folderId);
      const response = await axios.patch(
        `${API_URL}/api/servers/${serverId}/folders/${folderId}`,
        { expanded: !folder.expanded },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setServerData(prev => ({
        ...prev,
        folders: prev.folders.map(f => f.id === folderId ? { ...f, expanded: !f.expanded } : f)
      }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update folder");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  // Drag and drop logic for tabs
  const onTabDragStart = (tab, fromFolderId) => {
    setDraggedTab({ ...tab, fromFolderId });
  };

  const onTabDrop = async (folderId) => {
    if (!draggedTab) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/servers/${serverId}/tabs/${draggedTab.id}`,
        { folder_id: folderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setServerData(prev => {
        // Remove from old location
        let newFolders = prev.folders.map(f => ({ ...f, tabs: f.tabs.filter(t => t.id !== draggedTab.id) }));
        let newTabs = prev.tabs.filter(t => t.id !== draggedTab.id);
        
        // Add to new folder
        newFolders = newFolders.map(f =>
          f.id === folderId ? { ...f, tabs: [...f.tabs, draggedTab] } : f
        );
        
        return {
          ...prev,
          folders: newFolders,
          tabs: newTabs
        };
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to move tab");
      if (err.response?.status === 401) {
        navigate("/login");
      }
      // Revert on error
      fetchServerData();
    }
    setDraggedTab(null);
  };

  const onTabDropOutside = async () => {
    if (!draggedTab) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/servers/${serverId}/tabs/${draggedTab.id}`,
        { folder_id: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setServerData(prev => {
        // Remove from old location
        let newFolders = prev.folders.map(f => ({ ...f, tabs: f.tabs.filter(t => t.id !== draggedTab.id) }));
        let newTabs = [...prev.tabs, draggedTab];
        
        return {
          ...prev,
          folders: newFolders,
          tabs: newTabs
        };
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to move tab");
      if (err.response?.status === 401) {
        navigate("/login");
      }
      // Revert on error
      fetchServerData();
    }
    setDraggedTab(null);
  };

  // Drag and drop logic for folders
  const onFolderDragStart = (folder) => setDraggedFolder(folder);
  
  const onFolderDrop = async (targetFolderId) => {
    if (!draggedFolder) return;
    
    try {
      const token = localStorage.getItem("token");
      const folders = serverData.folders;
      const idx = folders.findIndex(f => f.id === draggedFolder.id);
      const targetIdx = folders.findIndex(f => f.id === targetFolderId);
      if (idx === -1 || targetIdx === -1) return;
      
      const newFolders = [...folders];
      newFolders.splice(idx, 1);
      newFolders.splice(targetIdx, 0, draggedFolder);
      
      // Update positions in database
      await Promise.all(newFolders.map((folder, index) => 
        axios.patch(
          `${API_URL}/api/servers/${serverId}/folders/${folder.id}`,
          { position: index },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ));
      
      setServerData(prev => ({
        ...prev,
        folders: newFolders
      }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reorder folders");
      if (err.response?.status === 401) {
        navigate("/login");
      }
      // Revert on error
      fetchServerData();
    }
    setDraggedFolder(null);
  };

  if (!serverId || !serverData) return null;
  const folders = serverData.folders || [];
  const tabs = serverData.tabs || [];

  return (
    <div style={{ background: "#181a1b", minHeight: "100vh", width: 220, padding: 0, display: "flex", flexDirection: "column" }}>
      {/* Server name */}
      <div style={{ display: "flex", alignItems: "center", padding: "20px 16px 10px 16px" }}>
        <div style={{ width: 36, height: 36, background: "#66c0f4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 20, color: "#23272b", marginRight: 12 }}>
          {serverData.name[0]}
        </div>
        <span style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{serverData.name}</span>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ margin: "0 16px 10px", background: "#ff4444", color: "white", padding: "8px 12px", borderRadius: 4, fontSize: 12 }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: "20px 16px", color: "#66c0f4" }}>Loading...</div>
      ) : (
        <>
          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, padding: "0 16px 10px 16px" }}>
            <button
              onClick={() => setShowFolderInput(true)}
              style={{ flex: 1, background: "#23272b", color: "#66c0f4", border: "1px solid #66c0f4", borderRadius: 6, fontWeight: "bold", padding: "8px 0", cursor: "pointer" }}
            >
              + Folder
            </button>
            <button
              onClick={() => setShowTabInput(true)}
              style={{ flex: 1, background: "#23272b", color: "#66c0f4", border: "1px solid #66c0f4", borderRadius: 6, fontWeight: "bold", padding: "8px 0", cursor: "pointer" }}
            >
              + Tab
            </button>
          </div>

          {/* Folder input */}
          {showFolderInput && (
            <div style={{ padding: "0 16px 10px 16px" }}>
              <input
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #66c0f4", marginBottom: 4, fontSize: 15, background: "#23272b", color: "#fff" }}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); }}
              />
              <button onClick={handleCreateFolder} style={{ marginRight: 8, background: "#66c0f4", color: "#23272b", border: "none", borderRadius: 6, fontWeight: "bold", padding: "6px 16px", cursor: "pointer" }}>Create</button>
              <button onClick={() => setShowFolderInput(false)} style={{ background: "#23272b", color: "#fff", border: "1px solid #66c0f4", borderRadius: 6, fontWeight: "bold", padding: "6px 16px", cursor: "pointer" }}>Cancel</button>
            </div>
          )}

          {/* Tab input */}
          {showTabInput && (
            <div style={{ padding: "0 16px 10px 16px" }}>
              <input
                autoFocus
                value={newTabName}
                onChange={e => setNewTabName(e.target.value)}
                placeholder="Tab name"
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #66c0f4", marginBottom: 4, fontSize: 15, background: "#23272b", color: "#fff" }}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateTab(); }}
              />
              <button onClick={handleCreateTab} style={{ marginRight: 8, background: "#66c0f4", color: "#23272b", border: "none", borderRadius: 6, fontWeight: "bold", padding: "6px 16px", cursor: "pointer" }}>Create</button>
              <button onClick={() => setShowTabInput(false)} style={{ background: "#23272b", color: "#fff", border: "1px solid #66c0f4", borderRadius: 6, fontWeight: "bold", padding: "6px 16px", cursor: "pointer" }}>Cancel</button>
            </div>
          )}

          {/* Folders */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 0 16px 0" }}>
            {folders.map(folder => (
              <div
                key={folder.id}
                draggable
                onDragStart={() => onFolderDragStart(folder)}
                onDragOver={e => e.preventDefault()}
                onDragEnter={e => { e.preventDefault(); }}
                onDrop={e => { e.stopPropagation(); onTabDrop(folder.id); }}
                style={{ margin: "8px 0", background: "#23272b", borderRadius: 6, marginLeft: 12, marginRight: 12, boxShadow: "0 1px 4px #0002" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "10px 12px", color: "#66c0f4", fontWeight: "bold", fontSize: 16 }}
                  onClick={() => toggleFolder(folder.id)}
                >
                  <span style={{ marginRight: 8 }}>{folder.expanded ? "▼" : "►"}</span>
                  <span>{folder.name}</span>
                </div>
                {folder.expanded && (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {folder.tabs.map(tab => {
                      const isActive = location.pathname.endsWith(`/tab/${tab.id}`);
                      return (
                        <li
                          key={tab.id}
                          draggable
                          onDragStart={() => onTabDragStart(tab, folder.id)}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => e.stopPropagation()}
                        >
                          <Link
                            to={`/server/${serverId}/tab/${tab.id}`}
                            style={{
                              display: "block",
                              margin: "6px 12px",
                              padding: "8px 16px",
                              background: isActive ? "#181a1b" : "#23272b",
                              borderRadius: 6,
                              color: "#fff",
                              fontWeight: "bold",
                              textDecoration: "none",
                              fontSize: 15,
                              transition: "background 0.2s",
                              cursor: "pointer",
                              border: isActive ? "2px solid #66c0f4" : "2px solid transparent"
                            }}
                          >
                            # {tab.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}

            {/* Tabs outside folders */}
            <ul
              style={{ listStyle: "none", padding: 0, margin: 0, minHeight: 40 }}
              onDragOver={e => e.preventDefault()}
              onDrop={onTabDropOutside}
            >
              {tabs.map(tab => {
                const isActive = location.pathname.endsWith(`/tab/${tab.id}`);
                return (
                  <li
                    key={tab.id}
                    draggable
                    onDragStart={() => onTabDragStart(tab, null)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => e.stopPropagation()}
                  >
                    <Link
                      to={`/server/${serverId}/tab/${tab.id}`}
                      style={{
                        display: "block",
                        margin: "6px 12px",
                        padding: "8px 16px",
                        background: isActive ? "#181a1b" : "#23272b",
                        borderRadius: 6,
                        color: "#fff",
                        fontWeight: "bold",
                        textDecoration: "none",
                        fontSize: 15,
                        transition: "background 0.2s",
                        cursor: "pointer",
                        border: isActive ? "2px solid #66c0f4" : "2px solid transparent"
                      }}
                    >
                      # {tab.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
} 