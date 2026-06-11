import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import api from './api';
import type { Message, Conversation, ConversationMember } from '../types';

const SOCKET_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api')
  .replace(/\/api$/, '');

let socket: Socket | null = null;

export const chatSocket = {
  connect(token: string): Socket {
    if (socket?.connected) return socket;
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    return socket;
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
  },

  getSocket(): Socket | null {
    return socket;
  },

  sendMessage(conversationId: string, content: string) {
    socket?.emit('send_message', { conversationId, content });
  },

  emitTyping(conversationId: string) {
    socket?.emit('typing', { conversationId });
  },

  emitStopTyping(conversationId: string) {
    socket?.emit('stop_typing', { conversationId });
  },

  joinConversation(conversationId: string) {
    socket?.emit('join_conversation', { conversationId });
  },
};

export const chatApi = {
  async getConversations(): Promise<Conversation[]> {
    const { data } = await api.get<{ conversations: Conversation[] }>('/chat/conversations');
    return data.conversations;
  },

  async createDirect(targetUserId: string): Promise<string> {
    const { data } = await api.post<{ conversationId: string }>('/chat/conversations/direct', { targetUserId });
    return data.conversationId;
  },

  async createGroup(name: string, memberIds: string[]): Promise<string> {
    const { data } = await api.post<{ conversationId: string }>('/chat/conversations/group', { name, memberIds });
    return data.conversationId;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data } = await api.get<{ messages: Message[] }>(`/chat/conversations/${conversationId}/messages`);
    return data.messages;
  },

  async uploadMessage(conversationId: string, file: File, type: 'image' | 'file' | 'audio'): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const { data } = await api.post<{ message: Message }>(
      `/chat/conversations/${conversationId}/messages/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.message;
  },

  async searchUsers(query: string): Promise<ConversationMember[]> {
    const { data } = await api.get<{ users: ConversationMember[] }>(
      `/chat/users/search?q=${encodeURIComponent(query)}`
    );
    return data.users;
  },
};
