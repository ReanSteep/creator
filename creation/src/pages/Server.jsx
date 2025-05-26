import ServerList from "../components/ServerList";
import ChannelList from "../components/ChannelList";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import UserList from "../components/UserList";
import TabEditor from "../components/TabEditor";
import { useParams } from "react-router-dom";
import { useState } from "react";

const myUserId = 1; // Placeholder for current user id
const serverOwners = { 1: 1, 2: 2, 3: 3 }; // Placeholder for server ownership

export default function Server() {
  const { serverId, channelId } = useParams();
  const isOwner = myUserId === serverOwners[serverId];
  // Store tab content per server/tab
  const [tabContent, setTabContent] = useState({});

  const handleTabContentChange = (tabId, content) => {
    setTabContent(prev => ({
      ...prev,
      [`${serverId}_${tabId}`]: content
    }));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#101214" }}>
      <ServerList />
      <ChannelList />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, background: "#23272b" }}>
        {channelId ? (
          isOwner ? (
            <TabEditor
              value={tabContent[`${serverId}_${channelId}`]}
              onChange={content => handleTabContentChange(channelId, content)}
            />
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