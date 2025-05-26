import { useState, useEffect, useCallback } from "react";

const defaultElements = [];

export default function TabEditor({ value, onChange }) {
  const [elements, setElements] = useState(value || defaultElements);
  const [draggedId, setDraggedId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState(null);

  // Sync with parent when value changes
  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(elements)) {
      setElements(value);
    }
  }, [value]);

  // Add new element
  const addElement = (type) => {
    const newEl = {
      id: Date.now(),
      type,
      x: Math.random() * 300 + 50, // Random position for better spread
      y: Math.random() * 200 + 50,
      text: type === "text" ? "Edit me" : undefined,
      url: type === "image" ? "https://placehold.co/100x100" : undefined,
      color: type === "shape" ? getRandomColor() : undefined,
      messages: type === "chat" ? [] : undefined,
      width: type === "chat" ? 300 : 100,
      height: type === "chat" ? 400 : 40,
      zIndex: elements.length + 1, // Stack new elements on top
    };
    const newElements = [...elements, newEl];
    setElements(newElements);
    onChange && onChange(newElements);
  };

  // Get random color for shapes
  const getRandomColor = () => {
    const colors = ['#66c0f4', '#ff7f50', '#98fb98', '#dda0dd', '#f0e68c'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Drag logic with bounds checking
  const onDragStart = (e, id) => {
    e.stopPropagation();
    setDraggedId(id);
    setSelectedElement(id);
    const el = elements.find(el => el.id === id);
    setOffset({ x: e.clientX - el.x, y: e.clientY - el.y });
    
    // Bring dragged element to front
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, zIndex: Math.max(...prev.map(e => e.zIndex || 0)) + 1 } : el
    ));
  };

  const onDrag = useCallback((e) => {
    if (draggedId === null) return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const el = elements.find(el => el.id === draggedId);
    
    // Calculate new position with bounds
    const newX = Math.max(0, Math.min(e.clientX - offset.x, container.width - el.width));
    const newY = Math.max(0, Math.min(e.clientY - offset.y, container.height - el.height));
    
    setElements(els => els.map(el =>
      el.id === draggedId ? { ...el, x: newX, y: newY } : el
    ));
  }, [draggedId, elements, offset]);

  const onDragEnd = () => {
    if (draggedId !== null) {
      setDraggedId(null);
      onChange && onChange(elements);
    }
  };

  // Delete element
  const deleteElement = (id) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    setSelectedElement(null);
    onChange && onChange(newElements);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedElement) {
        deleteElement(selectedElement);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  return (
    <div 
      style={{ 
        position: "relative", 
        width: "100%", 
        height: "calc(100vh - 200px)", 
        background: "#f4f4f4", 
        borderRadius: 8, 
        overflow: "hidden",
        margin: "24px 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}
      onMouseMove={onDrag}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
    >
      {/* Toolbar */}
      <div style={{ 
        position: "absolute", 
        top: 10, 
        left: 10, 
        zIndex: 1000,
        display: "flex", 
        gap: 8,
        background: "white",
        padding: "8px 12px",
        borderRadius: 8,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <button onClick={() => addElement("text")} style={buttonStyle}>Add Text</button>
        <button onClick={() => addElement("image")} style={buttonStyle}>Add Image</button>
        <button onClick={() => addElement("shape")} style={buttonStyle}>Add Shape</button>
        <button onClick={() => addElement("chat")} style={buttonStyle}>Add Chat</button>
        {selectedElement && (
          <button 
            onClick={() => deleteElement(selectedElement)} 
            style={{ ...buttonStyle, background: "#ff4444", color: "white" }}
          >
            Delete
          </button>
        )}
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
            zIndex: el.zIndex || 1,
            width: el.width,
            height: el.height,
            userSelect: "none",
            border: selectedElement === el.id ? "2px solid #66c0f4" : "none",
            borderRadius: 4,
            padding: selectedElement === el.id ? 2 : 0
          }}
          onMouseDown={e => onDragStart(e, el.id)}
        >
          {el.type === "text" && (
            <input
              value={el.text}
              onChange={e => {
                const newElements = elements.map(elem => 
                  elem.id === el.id ? { ...elem, text: e.target.value } : elem
                );
                setElements(newElements);
                onChange && onChange(newElements);
              }}
              style={{ 
                width: el.width, 
                height: el.height, 
                fontSize: 18, 
                border: "1px solid #aaa", 
                borderRadius: 4, 
                padding: 8,
                background: "white"
              }}
              onClick={e => e.stopPropagation()}
            />
          )}
          {el.type === "image" && (
            <div>
              <img 
                src={el.url} 
                alt="" 
                style={{ 
                  width: el.width, 
                  height: el.width, 
                  borderRadius: 4, 
                  border: "1px solid #aaa",
                  objectFit: "cover"
                }} 
              />
              <input
                value={el.url}
                onChange={e => {
                  const newElements = elements.map(elem =>
                    elem.id === el.id ? { ...elem, url: e.target.value } : elem
                  );
                  setElements(newElements);
                  onChange && onChange(newElements);
                }}
                style={{ 
                  width: el.width, 
                  fontSize: 12, 
                  marginTop: 4,
                  padding: 4,
                  border: "1px solid #aaa",
                  borderRadius: 4,
                  background: "white"
                }}
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          {el.type === "shape" && (
            <div 
              style={{ 
                width: el.width, 
                height: el.height, 
                background: el.color, 
                borderRadius: 6,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }} 
            />
          )}
          {el.type === "chat" && (
            <div style={{ 
              width: el.width, 
              height: el.height, 
              background: "white", 
              borderRadius: 6, 
              border: "1px solid #aaa",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
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
                    alignSelf: "flex-start",
                    wordBreak: "break-word"
                  }}>
                    {msg.text}
                    <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
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
                  onClick={e => e.stopPropagation()}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      const newElements = elements.map(elem => {
                        if (elem.id === el.id) {
                          const newMessages = [...(elem.messages || []), {
                            text: e.target.value.trim(),
                            timestamp: new Date().toISOString()
                          }];
                          return { ...elem, messages: newMessages };
                        }
                        return elem;
                      });
                      setElements(newElements);
                      onChange && onChange(newElements);
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

const buttonStyle = {
  padding: "8px 12px",
  borderRadius: 4,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontSize: 14,
  transition: "all 0.2s",
  ":hover": {
    background: "#f0f0f0"
  }
}; 