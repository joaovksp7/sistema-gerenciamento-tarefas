import type { Message } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isOwn, showSender }: MessageBubbleProps) {
  const { t } = useLanguage();

  const renderContent = () => {
    if (message.type === 'image' && message.filename) {
      return (
        <a href={message.url} target="_blank" rel="noopener noreferrer">
          <img
            src={message.url}
            alt={message.originalName || t.chat.imageMessage}
            className="max-w-48 max-h-48 rounded-lg object-cover"
          />
        </a>
      );
    }

    if (message.type === 'audio' && message.filename) {
      return (
        <audio controls className="max-w-56 h-10">
          <source src={message.url} type={message.mimetype} />
        </audio>
      );
    }

    if (message.type === 'file' && message.filename) {
      return (
        <a
          href={message.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 underline text-sm ${isOwn ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="truncate max-w-40">{message.originalName || t.chat.fileMessage}</span>
        </a>
      );
    }

    return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {showSender && !isOwn && (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1 px-1">
            {message.senderName}
          </span>
        )}
        <div
          className={`rounded-2xl px-3 py-2 shadow-sm ${
            isOwn
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-sm'
          }`}
        >
          {renderContent()}
          <p className={`text-xs mt-1 text-right ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
