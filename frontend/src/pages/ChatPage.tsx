import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { chatSocket, chatApi } from '../services/chatService';
import { ConversationList } from '../components/chat/ConversationList';
import { ConversationView } from '../components/chat/ConversationView';
import { AddContactModal } from '../components/chat/AddContactModal';
import { CreateGroupModal } from '../components/chat/CreateGroupModal';
import type { Conversation, Message } from '../types';

export function ChatPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const token = authService.getToken();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingConvs, setTypingConvs] = useState<Set<string>>(new Set());
  const [showAddContact, setShowAddContact] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  useEffect(() => {
    if (!token) return;

    chatApi.getConversations().then(setConversations).catch(() => {});

    const socket = chatSocket.connect(token);

    socket.on('receive_message', (msg: Message) => {
      setMessages((prev) => {
        const existing = prev[msg.conversationId] || [];
        if (existing.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [msg.conversationId]: [...existing, msg] };
      });
      setConversations((prev) =>
        [...prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessage: msg.content || msg.type, lastMessageAt: msg.createdAt, lastMessageSender: msg.senderName, lastMessageType: msg.type }
            : c
        )].sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
      );
    });

    socket.on('user_typing', ({ conversationId }: { conversationId: string; userId: string }) => {
      setTypingConvs((prev) => new Set([...prev, conversationId]));
    });

    socket.on('user_stop_typing', ({ conversationId }: { conversationId: string; userId: string }) => {
      setTypingConvs((prev) => { const next = new Set(prev); next.delete(conversationId); return next; });
    });

    socket.on('new_conversation', async () => {
      const convs = await chatApi.getConversations().catch(() => [] as Conversation[]);
      setConversations(convs);
      convs.forEach((c) => chatSocket.joinConversation(c.id));
    });

    return () => { chatSocket.disconnect(); };
  }, [token]);

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConvId(conv.id);
    setMobileShowChat(true);
    if (!messages[conv.id]) {
      const msgs = await chatApi.getMessages(conv.id).catch(() => [] as Message[]);
      setMessages((prev) => ({ ...prev, [conv.id]: msgs }));
    }
  };

  const handleCreateDirect = async (targetUserId: string) => {
    const convId = await chatApi.createDirect(targetUserId);
    chatSocket.joinConversation(convId);
    const convs = await chatApi.getConversations().catch(() => [] as Conversation[]);
    setConversations(convs);
    const conv = convs.find((c) => c.id === convId);
    if (conv) handleSelectConversation(conv);
    setShowAddContact(false);
  };

  const handleCreateGroup = async (name: string, memberIds: string[]) => {
    const convId = await chatApi.createGroup(name, memberIds);
    chatSocket.joinConversation(convId);
    const convs = await chatApi.getConversations().catch(() => [] as Conversation[]);
    setConversations(convs);
    const conv = convs.find((c) => c.id === convId);
    if (conv) handleSelectConversation(conv);
    setShowCreateGroup(false);
  };

  const handleMessageReceived = (msg: Message) => {
    setMessages((prev) => {
      const existing = prev[msg.conversationId] || [];
      if (existing.some((m) => m.id === msg.id)) return prev;
      return { ...prev, [msg.conversationId]: [...existing, msg] };
    });
  };

  const selectedConv = conversations.find((c) => c.id === selectedConvId) ?? null;
  const selectedMessages = selectedConvId ? (messages[selectedConvId] ?? []) : [];
  const isTyping = selectedConvId ? typingConvs.has(selectedConvId) : false;

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-bold text-gray-800 dark:text-white">
            {user?.name}
            <span className="text-xs text-gray-400 font-normal ml-2">@{user?.username}</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <aside className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedConvId}
            currentUserId={user?.id ?? ''}
            onSelect={handleSelectConversation}
            onAddContact={() => setShowAddContact(true)}
            onCreateGroup={() => setShowCreateGroup(true)}
          />
        </aside>

        {/* Right panel */}
        <main className={`flex-1 flex flex-col overflow-hidden ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
          {selectedConv ? (
            <ConversationView
              conversation={selectedConv}
              messages={selectedMessages}
              currentUserId={user?.id ?? ''}
              isTyping={isTyping}
              onBack={() => setMobileShowChat(false)}
              onMessageReceived={handleMessageReceived}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-400 text-sm">{t.chat.selectConversation}</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onStartChat={handleCreateDirect}
          currentUserId={user?.id ?? ''}
        />
      )}

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
          currentUserId={user?.id ?? ''}
        />
      )}
    </div>
  );
}
