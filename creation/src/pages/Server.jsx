import ServerList from "../components/ServerList";
import FolderTabList from "../components/FolderTabList";
import { useParams } from "react-router-dom";

export default function Server() {
  const { serverId, tabId } = useParams();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#101214" }}>
      <ServerList />
      <FolderTabList />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, background: "#23272b" }}>
        {tabId ? (
          <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>
            Selected tab: {tabId}
          </div>
        ) : (
          <div style={{ padding: 40, color: "#888" }}>Select a tab to start!</div>
        )}
      </div>
    </div>
  );
} 