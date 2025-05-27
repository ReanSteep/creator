import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as crypto from '../crypto';

// Add type declaration for Vite env
declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    }
  }
}

export function EncryptionTest() {
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Initialize user and keys
  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Initialize WebSocket connection
        const ws = new WebSocket(`ws://localhost:3000/ws/messages/test-tab`);
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, data]);
        };
        setWs(ws);
      }
    };
    initUser();
  }, []);

  const sendMessage = async () => {
    if (!ws || !message.trim()) return;
    
    ws.send(JSON.stringify({
      content: message
    }));
    setMessage('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Encryption Test</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ padding: '8px', width: '70%' }}
        />
        <button 
          onClick={sendMessage}
          style={{ padding: '8px 16px', marginLeft: '10px' }}
        >
          Send
        </button>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <strong>{msg.senderId === userId ? 'You' : 'Other'}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
} 