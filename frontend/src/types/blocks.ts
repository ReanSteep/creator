export type BlockType = 
  | 'text'
  | 'chat'
  | 'image'
  | 'video'
  | 'file'
  | 'link'
  | 'plugin'
  | 'code';

export interface BlockLayout {
  width: number;  // percentage
  alignment: 'left' | 'center' | 'right';
  padding: number;
}

export interface BlockStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadow?: string;
  fontFamily?: string;
  fontSize?: number;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  layout: BlockLayout;
  style: BlockStyle;
  position: number;
} 