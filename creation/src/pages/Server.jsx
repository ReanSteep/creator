import ServerList from "../components/ServerList";
import ChannelList from "../components/ChannelList";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import UserList from "../components/UserList";
import { useParams } from "react-router-dom";

export default function Server() {
  const { channelId } = useParams();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#101214" }}>
      <ServerList />
      <ChannelList />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, background: "#23272b" }}>
        {channelId ? (
          <>
            <ChatWindow />
            <MessageInput />
          </>
        ) : (
          <div style={{ padding: 40, color: "#888" }}>Select a channel to start chatting!</div>
        )}
      </div>
      <UserList />
    </div>
  );
} 