import { useState, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { chatApi } from '../../services/chatService';
import type { ConversationMember } from '../../types';

interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (name: string, memberIds: string[]) => Promise<void>;
  currentUserId: string;
}

export function CreateGroupModal({ onClose, onCreate, currentUserId }: CreateGroupModalProps) {
  const { t } = useLanguage();
  const [groupName, setGroupName] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ConversationMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<ConversationMember[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = useCallback(async (value: string) => {
    setMemberQuery(value);
    if (value.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const users = await chatApi.searchUsers(value.replace('@', ''));
      setSearchResults(
        users.filter((u) => u.id !== currentUserId && !selectedMembers.find((m) => m.id === u.id))
      );
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [currentUserId, selectedMembers]);

  const addMember = (user: ConversationMember) => {
    setSelectedMembers((prev) => [...prev, user]);
    setMemberQuery('');
    setSearchResults([]);
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    setCreating(true);
    try {
      await onCreate(groupName.trim(), selectedMembers.map((m) => m.id));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-white">{t.chat.createGroupTitle}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.chat.groupName}</label>
            <input
              autoFocus
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t.chat.groupNamePlaceholder}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.chat.addMembers}</label>
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedMembers.map((m) => (
                  <span key={m.id} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                    {m.name}
                    <button onClick={() => removeMember(m.id)} className="hover:text-blue-900 dark:hover:text-blue-100">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input
                type="text"
                value={memberQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t.chat.searchMember}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
              {searching && <p className="text-xs text-gray-400 py-2 text-center">...</p>}
              {!searching && memberQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-xs text-gray-400 py-2 text-center">{t.chat.noResults}</p>
              )}
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => addMember(user)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              {t.chat.cancel}
            </button>
            <button
              onClick={handleCreate}
              disabled={!groupName.trim() || selectedMembers.length === 0 || creating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {creating ? '...' : t.chat.createBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
