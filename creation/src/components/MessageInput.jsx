import { useState } from "react";

export default function MessageInput() {
  const [message, setMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      alert(`Message sent: ${message}`); // Placeholder for now
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSend} style={{ display: "flex", marginTop: 0, background: "#181a1b", padding: 16, borderRadius: 8 }}>
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type a message..."
        style={{ flex: 1, padding: 12, borderRadius: 6, border: "1px solid #23272b", background: "#23272b", color: "#fff", fontSize: 16 }}
      />
      <button type="submit" style={{ marginLeft: 12, padding: "12px 28px", background: "#66c0f4", color: "#181a1b", border: "none", borderRadius: 6, fontWeight: "bold", fontSize: 16, cursor: "pointer" }}>
        Send
      </button>
    </form>
  );
} 