import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { encryptMessage, decryptMessage } from '../crypto/e2ee';
import { loadKeyPair, getSharedKey } from '../crypto/keyManager';

export default function Chat() {
  const { messages, sendMessage } = useWebSocket();
  const [input, setInput] = useState('');
  const [decryptedMessages, setDecryptedMessages] = useState<string[]>([]);
  const chatListRef = useRef<HTMLDivElement>(null);

  // For demo: use our own keypair for both sender and receiver
  useEffect(() => {
    async function decryptAll() {
      const kp = await loadKeyPair();
      if (!kp) return;
      const sharedKey = await getSharedKey(kp.publicKey, kp.privateKey);
      const decs = await Promise.all(
        messages.map(async (msg) => {
          try {
            return await decryptMessage(msg, sharedKey);
          } catch {
            return '[decryption failed]';
          }
        })
      );
      setDecryptedMessages(decs);
      // Scroll to bottom
      chatListRef.current?.scrollTo(0, chatListRef.current.scrollHeight);
    }
    decryptAll();
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const kp = await loadKeyPair();
    if (!kp) return alert('No keypair found!');
    const sharedKey = await getSharedKey(kp.publicKey, kp.privateKey);
    const encrypted = await encryptMessage(input, sharedKey);
    sendMessage(encrypted);
    setInput('');
  }

  return (
    <div className="chat-container">
      <div className="chat-list" ref={chatListRef}>
        {decryptedMessages.map((msg, i) => (
          <div className="chat-message" key={i}>{msg}</div>
        ))}
      </div>
      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          className="chat-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="chat-send-btn" type="submit">Send</button>
      </form>
    </div>
  );
}
