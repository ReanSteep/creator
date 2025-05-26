import { useState } from "react";

const defaultElements = [];

export default function TabEditor({ value, onChange }) {
  const [elements, setElements] = useState(value || defaultElements);
  const [draggedId, setDraggedId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Add new element
  const addElement = (type) => {
    const newEl = {
      id: Date.now(),
      type,
      x: 50,
      y: 50,
      text: type === "text" ? "Edit me" : undefined,
      url: type === "image" ? "https://placehold.co/100x100" : undefined,
      color: type === "shape" ? "#66c0f4" : undefined,
      messages: type === "chat" ? [] : undefined,
      width: type === "chat" ? 300 : 100,
      height: type === "chat" ? 400 : 40,
    };
    setElements([...elements, newEl]);
    onChange && onChange([...elements, newEl]);
  };

  // Drag logic
  const onDragStart = (e, id) => {
    setDraggedId(id);
    const el = elements.find(el => el.id === id);
    setOffset({ x: e.clientX - el.x, y: e.clientY - el.y });
  };
  const onDrag = (e) => {
    if (draggedId === null) return;
    setElements(els => els.map(el =>
      el.id === draggedId ? { ...el, x: e.clientX - offset.x, y: e.clientY - offset.y } : el
    ));
  };
  const onDragEnd = () => {
    setDraggedId(null);
    onChange && onChange(elements);
  };

  // Edit text
  const onTextChange = (id, text) => {
    setElements(els => els.map(el => el.id === id ? { ...el, text } : el));
    onChange && onChange(elements.map(el => el.id === id ? { ...el, text } : el));
  };

  // Edit image url
  const onImageChange = (id, url) => {
    setElements(els => els.map(el => el.id === id ? { ...el, url } : el));
    onChange && onChange(elements.map(el => el.id === id ? { ...el, url } : el));
  };

  // Add chat message
  const addChatMessage = (id, message) => {
    setElements(els => els.map(el => {
      if (el.id === id) {
        const newMessages = [...(el.messages || []), { text: message, timestamp: new Date().toISOString() }];
        return { ...el, messages: newMessages };
      }
      return el;
    }));
    onChange && onChange(elements);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: 500, background: "#f4f4f4", borderRadius: 8, overflow: "hidden", margin: "24px 0" }}
      onMouseMove={onDrag}
      onMouseUp={onDragEnd}
    >
      {/* Toolbar */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, display: "flex", gap: 8 }}>
        <button onClick={() => addElement("text")}>Add Text</button>
        <button onClick={() => addElement("image")}>Add Image</button>
        <button onClick={() => addElement("shape")}>Add Shape</button>
        <button onClick={() => addElement("chat")}>Add Chat</button>
      </div>
      {/* Elements */}
      {elements.map(el => (
        <div
          key={el.id}
          style={{
            position: "absolute",
            left: el.x,
            top: el.y,
            cursor: "move",
            zIndex: draggedId === el.id ? 100 : 1,
            width: el.width,
            height: el.height,
            userSelect: "none"
          }}
          onMouseDown={e => onDragStart(e, el.id)}
        >
          {el.type === "text" && (
            <input
              value={el.text}
              onChange={e => onTextChange(el.id, e.target.value)}
              style={{ width: el.width, height: el.height, fontSize: 18, border: "1px solid #aaa", borderRadius: 4, padding: 4 }}
            />
          )}
          {el.type === "image" && (
            <div>
              <img src={el.url} alt="" style={{ width: el.width, height: el.height, borderRadius: 4, border: "1px solid #aaa" }} />
              <input
                value={el.url}
                onChange={e => onImageChange(el.id, e.target.value)}
                style={{ width: el.width, fontSize: 12, marginTop: 2 }}
              />
            </div>
          )}
          {el.type === "shape" && (
            <div style={{ width: el.width, height: el.height, background: el.color, borderRadius: 6, border: "1px solid #aaa" }} />
          )}
          {el.type === "chat" && (
            <div style={{ 
              width: el.width, 
              height: el.height, 
              background: "white", 
              borderRadius: 6, 
              border: "1px solid #aaa",
              display: "flex",
              flexDirection: "column"
            }}>
              {/* Chat messages */}
              <div style={{ 
                flex: 1, 
                overflowY: "auto", 
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 8
              }}>
                {(el.messages || []).map((msg, i) => (
                  <div key={i} style={{
                    background: "#f0f0f0",
                    padding: "8px 12px",
                    borderRadius: 12,
                    maxWidth: "80%",
                    alignSelf: "flex-start"
                  }}>
                    {msg.text}
                  </div>
                ))}
              </div>
              {/* Chat input */}
              <div style={{ 
                borderTop: "1px solid #eee", 
                padding: 10,
                display: "flex",
                gap: 8
              }}>
                <input
                  placeholder="Type a message..."
                  style={{ 
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 20,
                    border: "1px solid #ddd",
                    outline: "none"
                  }}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      addChatMessage(el.id, e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 