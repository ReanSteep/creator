import { useParams } from "react-router-dom";

const placeholderMessages = {
  101: [
    { id: 1, user: "Alice", content: "Welcome to AI Club!" },
    { id: 2, user: "Bob", content: "Hey everyone!" },
  ],
  102: [
    { id: 1, user: "Charlie", content: "Let's talk about AI!" },
  ],
  201: [
    { id: 1, user: "Dave", content: "Ready to game?" },
  ],
  202: [
    { id: 1, user: "Eve", content: "What games are you playing?" },
  ],
  301: [
    { id: 1, user: "Frank", content: "Music is life!" },
  ],
  302: [
    { id: 1, user: "Grace", content: "Share your favorite tracks!" },
  ],
};

export default function ChatWindow() {
  const { channelId } = useParams();
  const messages = placeholderMessages[channelId] || [];
  return (
    <div style={{ padding: 24, background: "#23272b", minHeight: 300, borderRadius: 8, color: "#e6e6e6", flex: 1, overflowY: "auto" }}>
      <h5 style={{ color: "#66c0f4", marginBottom: 16 }}>Messages</h5>
      <div>
        {messages.map(msg => (
          <div key={msg.id} style={{ margin: "12px 0", background: "#181a1b", borderRadius: 6, padding: "10px 16px" }}>
            <b style={{ color: "#66c0f4" }}>{msg.user}:</b> <span style={{ color: "#fff" }}>{msg.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 