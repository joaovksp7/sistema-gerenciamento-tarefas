import { useState, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { chatApi } from '../../services/chatService';
import type { ConversationMember } from '../../types';

interface AddContactModalProps {
  onClose: () => void;
  onStartChat: (userId: string) => Promise<void>;
  currentUserId: string;
}

export function AddContactModal({ onClose, onStartChat, currentUserId }: AddContactModalProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ConversationMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const users = await chatApi.searchUsers(value.replace('@', ''));
      setResults(users.filter((u) => u.id !== currentUserId));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const handleStart = async (userId: string) => {
    setStarting(userId);
    try { await onStartChat(userId); } finally { setStarting(null); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">{t.chat.addContactTitle}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t.chat.searchUser}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {loading && (
              <p className="text-sm text-gray-400 text-center py-4">{t.chat.searchUser}...</p>
            )}
            {!loading && query.length >= 2 && results.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">{t.chat.noResults}</p>
            )}
            {results.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStart(user.id)}
                  disabled={starting === user.id}
                  className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {t.chat.startChat}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
