import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const defaultFolders = [
  {
    id: 1,
    name: "General Stuff",
    expanded: true,
    tabs: [
      { id: 101, name: "general" },
      { id: 102, name: "ai-discussion" },
    ],
  },
  {
    id: 2,
    name: "Fun",
    expanded: false,
    tabs: [
      { id: 103, name: "memes" },
    ],
  },
];
const defaultTabs = [
  { id: 104, name: "random" },
  { id: 105, name: "off-topic" },
];

export default function ChannelList() {
  const { serverId, channelId } = useParams();
  const location = useLocation();
  // Simulate getting server name from id
  const serverName = serverId === "1" ? "AI Club" : serverId === "2" ? "Gaming" : serverId === "3" ? "Music" : "Server";

  // State: folders/tabs per server
  const [serverData, setServerData] = useState({
    1: { folders: defaultFolders, tabs: defaultTabs },
    2: { folders: [], tabs: [] },
    3: { folders: [], tabs: [] },
  });
  const [draggedTab, setDraggedTab] = useState(null);
  const [draggedFolder, setDraggedFolder] = useState(null);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [showTabInput, setShowTabInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newTabName, setNewTabName] = useState("");

  // Ensure new servers get initialized
  useEffect(() => {
    if (serverId && !serverData[serverId]) {
      setServerData(prev => ({ ...prev, [serverId]: { folders: [], tabs: [] } }));
    }
  }, [serverId, serverData]);

  if (!serverId) return null;
  const folders = serverData[serverId]?.folders || [];
  const tabs = serverData[serverId]?.tabs || [];

  // Folder expand/collapse
  const toggleFolder = (folderId) => {
    setServerData(prev => ({
      ...prev,
      [serverId]: {
        ...prev[serverId],
        folders: prev[serverId].folders.map(f => f.id === folderId ? { ...f, expanded: !f.expanded } : f)
      }
    }));
  };

  // Create folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setServerData(prev => ({
        ...prev,
        [serverId]: {
          ...prev[serverId],
          folders: [
            ...prev[serverId].folders,
            { id: Date.now(), name: newFolderName.trim(), expanded: true, tabs: [] }
          ]
        }
      }));
      setNewFolderName("");
      setShowFolderInput(false);
    }
  };

  // Create tab (outside folders)
  const handleCreateTab = () => {
    if (newTabName.trim()) {
      setServerData(prev => ({
        ...prev,
        [serverId]: {
          ...prev[serverId],
          tabs: [...prev[serverId].tabs, { id: Date.now(), name: newTabName.trim() }]
        }
      }));
      setNewTabName("");
      setShowTabInput(false);
    }
  };

  // Drag and drop logic for tabs
  const onTabDragStart = (tab, fromFolderId) => {
    setDraggedTab({ ...tab, fromFolderId });
  };
  const onTabDrop = (folderId) => {
    if (!draggedTab) return;
    setServerData(prev => {
      // Remove from old location
      let newFolders = prev[serverId].folders.map(f => ({ ...f, tabs: f.tabs.filter(t => t.id !== draggedTab.id) }));
      let newTabs = prev[serverId].tabs.filter(t => t.id !== draggedTab.id);
      // Add to new folder
      newFolders = newFolders.map(f =>
        f.id === folderId ? { ...f, tabs: [...f.tabs, { id: draggedTab.id, name: draggedTab.name }] } : f
      );
      return {
        ...prev,
        [serverId]: {
          ...prev[serverId],
          folders: newFolders,
          tabs: newTabs
        }
      };
    });
    setDraggedTab(null);
  };
  const onTabDropOutside = () => {
    if (!draggedTab) return;
    setServerData(prev => {
      // Remove from old location
      let newFolders = prev[serverId].folders.map(f => ({ ...f, tabs: f.tabs.filter(t => t.id !== draggedTab.id) }));
      let newTabs = [...prev[serverId].tabs, { id: draggedTab.id, name: draggedTab.name }];
      return {
        ...prev,
        [serverId]: {
          ...prev[serverId],
          folders: newFolders,
          tabs: newTabs
        }
      };
    });
    setDraggedTab(null);
  };

  // Drag and drop logic for folders (reordering)
  const onFolderDragStart = (folder) => setDraggedFolder(folder);
  const onFolderDrop = (targetFolderId) => {
    if (!draggedFolder) return;
    setServerData(prev => {
      const folders = prev[serverId].folders;
      const idx = folders.findIndex(f => f.id === draggedFolder.id);
      const targetIdx = folders.findIndex(f => f.id === targetFolderId);
      if (idx === -1 || targetIdx === -1) return prev;
      const newFolders = [...folders];
      newFolders.splice(idx, 1);
      newFolders.splice(targetIdx, 0, draggedFolder);
      return {
        ...prev,
        [serverId]: {
          ...prev[serverId],
          folders: newFolders
        }
      };
    });
    setDraggedFolder(null);
  };

  return (
    <div style={{ background: "#181a1b", minHeight: "100vh", width: 220, padding: 0, display: "flex", flexDirection: "column" }}>
      {/* Server icon and name */}
      <div style={{ display: "flex", alignItems: "center", padding: "20px 16px 10px 16px" }}>
        <div style={{ width: 36, height: 36, background: "#66c0f4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 20, color: "#23272b", marginRight: 12 }}>
          {serverName[0]}
        </div>
        <span style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{serverName}</span>
      </div>
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
          <button onClick={handleCreateFolder} style={{ marginRight: 8, background: "#66c0f4", color: "#23272b", border: "none", borderRadius: 6, fontWeight: "bold", padding: "6px 16px", cursor: "pointer" }}>Enter</button>
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
          <button onClick={handleCreateTab} style={{ marginRight: 8, background: "#66c0f4", color: "#23272b", border: "none", borderRadius: 6, fontWeight: "bold", padding: "6px 16px", cursor: "pointer" }}>Enter</button>
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
                  const isActive = location.pathname.endsWith(`/channel/${tab.id}`);
                  return (
                    <li
                      key={tab.id}
                      draggable
                      onDragStart={() => onTabDragStart(tab, folder.id)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => e.stopPropagation()}
                    >
                      <div
                        style={{
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
                      </div>
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
            const isActive = location.pathname.endsWith(`/channel/${tab.id}`);
            return (
              <li
                key={tab.id}
                draggable
                onDragStart={() => onTabDragStart(tab, null)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => e.stopPropagation()}
              >
                <div
                  style={{
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
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
} 