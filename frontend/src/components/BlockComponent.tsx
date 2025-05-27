import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Resizable } from 'react-resizable';
import type { Block } from '../types/blocks';
import { FaGripVertical, FaTrash } from 'react-icons/fa';
import 'react-resizable/css/styles.css';

interface BlockComponentProps {
  block: Block;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
}

export default function BlockComponent({ 
  block, 
  index, 
  moveBlock, 
  updateBlock, 
  deleteBlock 
}: BlockComponentProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'BLOCK',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'BLOCK',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const handleResize = (e: any, { size }: { size: { width: number } }) => {
    updateBlock(block.id, {
      layout: {
        ...block.layout,
        width: (size.width / window.innerWidth) * 100
      }
    });
  };

  const blockStyle = {
    width: `${block.layout.width}%`,
    padding: `${block.layout.padding}px`,
    backgroundColor: block.style.backgroundColor,
    border: `${block.style.borderWidth}px solid ${block.style.borderColor}`,
    borderRadius: `${block.style.borderRadius}px`,
    boxShadow: block.style.shadow,
    fontFamily: block.style.fontFamily,
    fontSize: `${block.style.fontSize}px`,
    opacity: isDragging ? 0.5 : 1,
    margin: '8px 0',
    position: 'relative' as const
  };

  return (
    <div ref={ref} style={blockStyle}>
      <div className="block-handle">
        <FaGripVertical className="drag-handle" />
        <button 
          onClick={() => deleteBlock(block.id)}
          className="btn-secondary"
        >
          <FaTrash />
        </button>
      </div>
      <Resizable
        width={block.layout.width * window.innerWidth / 100}
        height={200}
        onResize={handleResize}
        draggableOpts={{ grid: [25, 25] }}
      >
        <div style={{ width: '100%', height: '100%' }}>
          {block.type === 'text' && (
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter text..."
              style={{ width: '100%', height: '100%', resize: 'none' }}
            />
          )}
          {block.type === 'image' && (
            <div className="image-block">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // TODO: Handle image upload
                    updateBlock(block.id, { content: URL.createObjectURL(file) });
                  }
                }}
              />
              {block.content && (
                <img src={block.content} alt="Uploaded" style={{ maxWidth: '100%' }} />
              )}
            </div>
          )}
          {block.type === 'video' && (
            <div className="video-block">
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Enter video URL..."
              />
              {block.content && (
                <video src={block.content} controls style={{ maxWidth: '100%' }} />
              )}
            </div>
          )}
          {block.type === 'code' && (
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter code..."
              style={{ 
                width: '100%', 
                height: '100%', 
                resize: 'none',
                fontFamily: 'monospace'
              }}
            />
          )}
        </div>
      </Resizable>
    </div>
  );
} 