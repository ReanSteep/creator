import ServerList from "../components/ServerList";
import ChannelList from "../components/ChannelList";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import UserList from "../components/UserList";
import TabEditor from "../components/TabEditor";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const myUserId = 1; // Placeholder for current user id
const serverOwners = { 1: 1, 2: 2, 3: 3 }; // Placeholder for server ownership

export default function Server() {
  const { serverId, channelId } = useParams();
  const isOwner = myUserId === serverOwners[serverId];
  
  // Store tab content per server/channel combination
  const [tabStates, setTabStates] = useState({});
  const [activeTabHistory, setActiveTabHistory] = useState([]);

  // Load tab state when channel changes
  useEffect(() => {
    if (channelId) {
      const tabKey = `${serverId}_${channelId}`;
      // Initialize tab if it doesn't exist
      if (!tabStates[tabKey]) {
        setTabStates(prev => ({
          ...prev,
          [tabKey]: {
            content: [],
            lastModified: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        }));
      }
      // Update tab history
      setActiveTabHistory(prev => {
        const newHistory = prev.filter(tab => tab !== tabKey);
        return [...newHistory, tabKey].slice(-5); // Keep last 5 tabs in history
      });
    }
  }, [channelId, serverId]);

  const handleTabContentChange = (tabId, content) => {
    const tabKey = `${serverId}_${tabId}`;
    setTabStates(prev => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        content,
        lastModified: new Date().toISOString()
      }
    }));
  };

  // Get content for current tab
  const getCurrentTabContent = () => {
    if (!channelId) return null;
    const tabKey = `${serverId}_${channelId}`;
    return tabStates[tabKey]?.content || [];
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#101214" }}>
      <ServerList />
      <ChannelList />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, background: "#23272b" }}>
        {channelId ? (
          isOwner ? (
            <>
              <div style={{ marginBottom: 16, color: "#888" }}>
                Recent tabs: {activeTabHistory.map(tabKey => tabKey.split('_')[1]).join(', ')}
              </div>
              <TabEditor
                value={getCurrentTabContent()}
                onChange={content => handleTabContentChange(channelId, content)}
                key={`${serverId}_${channelId}`} // Force new instance on tab change
              />
            </>
          ) : (
            <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>
              This tab is only editable by the server owner.
            </div>
          )
        ) : (
          <div style={{ padding: 40, color: "#888" }}>Select a channel to start chatting!</div>
        )}
      </div>
      <UserList />
    </div>
  );
} 