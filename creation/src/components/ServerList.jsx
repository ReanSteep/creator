import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

// Temporary mock data
const mockServers = [
  { id: 1, name: "Server 1", owner_id: "1" },
  { id: 2, name: "Server 2", owner_id: "2" },
  { id: 3, name: "Server 3", owner_id: "1" }
];

export default function ServerList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [servers, setServers] = useState(mockServers);
  const [showModal, setShowModal] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [draggedServer, setDraggedServer] = useState(null);

  const handleAddServer = () => {
    if (!newServerName.trim()) return;
    
    const newServer = {
      id: Date.now(),
      name: newServerName.trim(),
      owner_id: "1" // Mock user ID
    };
    
    setServers([...servers, newServer]);
    setNewServerName("");
    setShowModal(false);
  };

  // Drag and drop for servers
  const onServerDragStart = (server) => setDraggedServer(server);
  const onServerDrop = (targetServerId) => {
    if (!draggedServer) return;
    
    const idx = servers.findIndex(s => s.id === draggedServer.id);
    const targetIdx = servers.findIndex(s => s.id === targetServerId);
    if (idx === -1 || targetIdx === -1) return;
    
    const newServers = [...servers];
    newServers.splice(idx, 1);
    newServers.splice(targetIdx, 0, draggedServer);
    
    setServers(newServers);
    setDraggedServer(null);
  };

  return (
    <>
      <div style={{ background: "#23272b", minHeight: "100vh", width: 80, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20, position: "relative" }}>
        {/* Logo box */}
        <div style={{ width: 48, height: 48, background: "#66c0f4", borderRadius: 8, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 24, color: "#23272b", letterSpacing: 1 }}>
          <span>DC</span>
        </div>

        {/* Add server box */}
        <div
          onClick={() => setShowModal(true)}
          style={{
            width: 48,
            height: 48,
            marginBottom: 24,
            background: "#181a1b",
            borderRadius: 8,
            color: "#66c0f4",
            fontWeight: "bold",
            fontSize: 32,
            textAlign: "center",
            lineHeight: "48px",
            cursor: "pointer",
            border: "2px solid #66c0f4",
            transition: "background 0.2s"
          }}
          onMouseOver={e => (e.currentTarget.style.background = "#3a3f44")}
          onMouseOut={e => (e.currentTarget.style.background = "#181a1b")}
        >
          +
        </div>

        {/* Server list */}
        {servers.map(server => {
          const isActive = location.pathname.includes(`/server/${server.id}`);
          const isMine = server.owner_id === "1"; // Mock user ID
          return (
            <div
              key={server.id}
              draggable
              onDragStart={() => onServerDragStart(server)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onServerDrop(server.id)}
              style={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <Link
                to={`/server/${server.id}`}
                style={{
                  display: "block",
                  width: 48,
                  height: 48,
                  margin: "12px 0",
                  background: isActive ? "#3a3f44" : "#181a1b",
                  borderRadius: 8,
                  color: "#fff",
                  fontWeight: "bold",
                  textAlign: "center",
                  lineHeight: "48px",
                  textDecoration: "none",
                  fontSize: 18,
                  transition: "background 0.2s",
                  boxShadow: isActive ? "0 0 0 2px #66c0f4" : undefined,
                  border: isMine ? "2px solid #5fff5f" : undefined,
                  position: "relative"
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#3a3f44")}
                onMouseOut={e => (e.currentTarget.style.background = isActive ? "#3a3f44" : "#181a1b")}
                title={server.name}
              >
                {server.name[0]}
                {isMine && (
                  <span style={{ position: "absolute", top: 2, right: 4, fontSize: 12, color: "#5fff5f" }}>★</span>
                )}
              </Link>
            </div>
          );
        })}

        {/* Login button at the bottom */}
        <button
          onClick={() => navigate("/login")}
          style={{
            position: "absolute",
            left: 16,
            bottom: 24,
            width: 48,
            height: 48,
            background: "#181a1b",
            borderRadius: 8,
            color: "#66c0f4",
            fontWeight: "bold",
            fontSize: 20,
            border: "2px solid #66c0f4",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseOver={e => (e.currentTarget.style.background = "#3a3f44")}
          onMouseOut={e => (e.currentTarget.style.background = "#181a1b")}
          title="Back to Login"
        >
          ⬅
        </button>
      </div>

      {/* Overlay modal for adding server */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{ background: "#23272b", padding: 32, borderRadius: 12, minWidth: 320, boxShadow: "0 4px 32px #0008" }}>
            <h3 style={{ color: "#fff", marginBottom: 16 }}>Create a new server</h3>
            <input
              autoFocus
              value={newServerName}
              onChange={e => setNewServerName(e.target.value)}
              placeholder="Server name"
              style={{ width: "100%", padding: 12, borderRadius: 6, border: "1px solid #66c0f4", marginBottom: 20, fontSize: 16, background: "#181a1b", color: "#fff" }}
              onKeyDown={e => { if (e.key === 'Enter') handleAddServer(); }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "10px 20px", background: "#181a1b", color: "#fff", border: "1px solid #66c0f4", borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddServer}
                style={{ padding: "10px 20px", background: "#66c0f4", color: "#23272b", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 