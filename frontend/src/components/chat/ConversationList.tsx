import { useState } from 'react';
import type { Conversation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  currentUserId: string;
  onSelect: (conv: Conversation) => void;
  onAddContact: () => void;
  onCreateGroup: () => void;
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function ConversationList({ conversations, selectedId, currentUserId, onSelect, onAddContact, onCreateGroup }: ConversationListProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const getConvName = (conv: Conversation): string => {
    if (conv.type === 'group') return conv.name || t.chat.group;
    const other = conv.members?.find((m) => m.id !== currentUserId);
    return other?.name || t.chat.unknown;
  };

  const getLastMessagePreview = (conv: Conversation): string => {
    if (!conv.lastMessage) {
      if (conv.type === 'group') return `${(conv.members?.length ?? 0)} ${t.chat.membersCount}`;
      return '';
    }
    if (conv.lastMessageType === 'image') return `📷 ${t.chat.imageMessage}`;
    if (conv.lastMessageType === 'audio') return `🎤 ${t.chat.audioMessage}`;
    if (conv.lastMessageType === 'file') return `📄 ${t.chat.fileMessage}`;
    return conv.lastMessage;
  };

  const filtered = conversations.filter((c) =>
    getConvName(c).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg">{t.chat.title}</h2>
          <div className="flex gap-1">
            <button
              onClick={onAddContact}
              title={t.chat.addContact}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
            <button
              onClick={onCreateGroup}
              title={t.chat.createGroup}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.chat.searchPlaceholder}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 rounded-full px-4 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm p-8 whitespace-pre-line">{t.chat.noConversations}</p>
        ) : (
          filtered.map((conv) => {
            const name = getConvName(conv);
            const preview = getLastMessagePreview(conv);
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left border-b border-gray-100 dark:border-gray-700/50 ${
                  selectedId === conv.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-lg ${conv.type === 'group' ? 'bg-green-500' : 'bg-blue-500'}`}>
                  {conv.type === 'group' ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-gray-800 dark:text-white text-sm truncate">{name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(conv.lastMessageAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{preview}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
