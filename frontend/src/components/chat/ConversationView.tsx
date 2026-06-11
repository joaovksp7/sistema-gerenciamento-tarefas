import { useState, useRef, useEffect } from 'react';
import type { Message, Conversation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { chatSocket, chatApi } from '../../services/chatService';
import { MessageBubble } from './MessageBubble';

interface ConversationViewProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  isTyping: boolean;
  onBack: () => void;
  onMessageReceived: (msg: Message) => void;
}

export function ConversationView({ conversation, messages, currentUserId, isTyping, onBack, onMessageReceived }: ConversationViewProps) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getConvName = (): string => {
    if (conversation.type === 'group') return conversation.name || t.chat.group;
    const other = conversation.members?.find((m) => m.id !== currentUserId);
    return other?.name || t.chat.unknown;
  };

  const getConvSubtitle = (): string => {
    if (conversation.type === 'group') {
      return `${conversation.members?.length ?? 0} ${t.chat.membersCount}`;
    }
    const other = conversation.members?.find((m) => m.id !== currentUserId);
    return other ? `@${other.username}` : '';
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    chatSocket.emitTyping(conversation.id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => chatSocket.emitStopTyping(conversation.id), 2000);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    chatSocket.sendMessage(conversation.id, text.trim());
    setText('');
    chatSocket.emitStopTyping(conversation.id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      const msg = await chatApi.uploadMessage(conversation.id, file, type);
      onMessageReceived(msg);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
        setUploading(true);
        try {
          const msg = await chatApi.uploadMessage(conversation.id, file, 'audio');
          onMessageReceived(msg);
        } catch { /* silent */ } finally { setUploading(false); }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      // microphone not available
    }
  };

  const isGroup = conversation.type === 'group';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${isGroup ? 'bg-green-500' : 'bg-blue-500'}`}>
          {isGroup ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            getConvName().charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-white text-sm">{getConvName()}</p>
          <p className="text-xs text-gray-400">{getConvSubtitle()}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-900 space-y-0.5">
        {messages.map((msg, i) => {
          const prevMsg = i > 0 ? messages[i - 1] : null;
          const showSender = isGroup && (!prevMsg || prevMsg.senderId !== msg.senderId);
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
              showSender={showSender}
            />
          );
        })}
        {isTyping && (
          <div className="flex justify-start mb-1">
            <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt" className="hidden" onChange={handleFileChange} />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title={t.chat.attach}
          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <button
          onClick={toggleRecording}
          disabled={uploading}
          title={isRecording ? t.chat.stopRecord : t.chat.record}
          className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
            isRecording
              ? 'text-red-600 bg-red-50 dark:bg-red-900/20 animate-pulse'
              : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={uploading ? '...' : t.chat.typeMessage}
          disabled={uploading}
          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || uploading}
          title={t.chat.send}
          className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
