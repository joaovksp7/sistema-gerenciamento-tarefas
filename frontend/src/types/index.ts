export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'image' | 'file' | 'audio';
  content?: string;
  filename?: string;
  originalName?: string;
  mimetype?: string;
  size?: number;
  url?: string;
  createdAt: string;
}

export interface ConversationMember {
  id: string;
  name: string;
  username: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageSender?: string;
  lastMessageType?: string;
  members: ConversationMember[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Attachment {
  id: string;
  taskId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url?: string;
  createdAt: string;
}

export type TaskFilter = 'all' | 'pending' | 'completed';
