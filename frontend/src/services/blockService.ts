import type { Block } from '../types/blocks';

const API_URL = 'http://localhost:3000/api';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getBlocks(pageId: string): Promise<Block[]> {
  try {
    const response = await fetch(`${API_URL}/pages/${pageId}/blocks`);
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch blocks:', error);
    throw error;
  }
}

export async function createBlock(pageId: string, block: Omit<Block, 'id'>): Promise<Block> {
  try {
    const response = await fetch(`${API_URL}/pages/${pageId}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(block)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to create block:', error);
    throw error;
  }
}

export async function updateBlock(id: string, block: Partial<Block>): Promise<Block> {
  try {
    const response = await fetch(`${API_URL}/blocks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(block)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to update block:', error);
    throw error;
  }
}

export async function deleteBlock(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/blocks/${id}`, {
      method: 'DELETE'
    });
    await handleResponse(response);
  } catch (error) {
    console.error('Failed to delete block:', error);
    throw error;
  }
}

export async function reorderBlocks(pageId: string, blockIds: string[]): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/pages/${pageId}/blocks/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockIds })
    });
    await handleResponse(response);
  } catch (error) {
    console.error('Failed to reorder blocks:', error);
    throw error;
  }
} 