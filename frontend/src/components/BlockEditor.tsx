import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState, useEffect } from 'react';
import type { Block, BlockType } from '../types/blocks';
import BlockComponent from './BlockComponent';
import { FaPlus } from 'react-icons/fa';
import * as blockService from '../services/blockService';

const defaultLayout = {
  width: 100,
  alignment: 'left' as const,
  padding: 16
};

const defaultStyle = {
  backgroundColor: 'transparent',
  borderColor: '#2c313a',
  borderWidth: 1,
  borderRadius: 8,
  shadow: 'none',
  fontFamily: 'inherit',
  fontSize: 16
};

interface BlockEditorProps {
  pageId: string;
}

export default function BlockEditor({ pageId }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBlocks();
  }, [pageId]);

  const loadBlocks = async () => {
    try {
      setLoading(true);
      const loadedBlocks = await blockService.getBlocks(pageId);
      setBlocks(loadedBlocks);
      setError(null);
    } catch (err) {
      setError('Failed to load blocks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addBlock = async (type: BlockType) => {
    try {
      const newBlock = await blockService.createBlock(pageId, {
        type,
        content: '',
        layout: { ...defaultLayout },
        style: { ...defaultStyle },
        position: blocks.length
      });
      setBlocks([...blocks, newBlock]);
    } catch (err) {
      setError('Failed to create block');
      console.error(err);
    }
  };

  const moveBlock = async (dragIndex: number, hoverIndex: number) => {
    const draggedBlock = blocks[dragIndex];
    const newBlocks = [...blocks];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, draggedBlock);
    newBlocks.forEach((block, index) => {
      block.position = index;
    });
    setBlocks(newBlocks);

    try {
      await blockService.reorderBlocks(pageId, newBlocks.map(b => b.id));
    } catch (err) {
      setError('Failed to reorder blocks');
      console.error(err);
      // Revert on error
      loadBlocks();
    }
  };

  const updateBlock = async (id: string, updates: Partial<Block>) => {
    try {
      const updatedBlock = await blockService.updateBlock(id, updates);
      setBlocks(blocks.map(block => 
        block.id === id ? updatedBlock : block
      ));
    } catch (err) {
      setError('Failed to update block');
      console.error(err);
    }
  };

  const deleteBlock = async (id: string) => {
    try {
      await blockService.deleteBlock(id);
      setBlocks(blocks.filter(block => block.id !== id));
    } catch (err) {
      setError('Failed to delete block');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading blocks...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="block-editor">
        <div className="block-toolbar">
          <button onClick={() => addBlock('text')} className="btn-primary">
            <FaPlus /> Text
          </button>
          <button onClick={() => addBlock('image')} className="btn-primary">
            <FaPlus /> Image
          </button>
          <button onClick={() => addBlock('video')} className="btn-primary">
            <FaPlus /> Video
          </button>
          <button onClick={() => addBlock('file')} className="btn-primary">
            <FaPlus /> File
          </button>
          <button onClick={() => addBlock('code')} className="btn-primary">
            <FaPlus /> Code
          </button>
        </div>
        <div className="blocks-container">
          {blocks.map((block, index) => (
            <BlockComponent
              key={block.id}
              block={block}
              index={index}
              moveBlock={moveBlock}
              updateBlock={updateBlock}
              deleteBlock={deleteBlock}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
} 