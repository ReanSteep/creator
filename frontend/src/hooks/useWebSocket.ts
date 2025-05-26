import { useEffect, useRef, useState } from 'react';

export function useWebSocket() {
  const [messages, setMessages] = useState<Uint8Array[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new window.WebSocket('ws://localhost:3000/ws');
    ws.current.binaryType = 'arraybuffer';

    ws.current.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        setMessages((prev) => [...prev, new Uint8Array(event.data)]);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  function sendMessage(data: Uint8Array) {
    if (ws.current && ws.current.readyState === ws.current.OPEN) {
      ws.current.send(data);
    }
  }

  return { messages, sendMessage };
}
