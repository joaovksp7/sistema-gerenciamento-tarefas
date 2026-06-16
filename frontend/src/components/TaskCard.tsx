import { useState, useEffect, useRef } from 'react';
import type { Task, Attachment } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { taskService } from '../services/taskService';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    taskService.getAttachments(task.id)
      .then((data) => { if (!cancelled) setAttachments(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [task.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const newAttachment = await taskService.uploadAttachment(task.id, file);
      setAttachments((prev) => [...prev, newAttachment]);
    } catch {
      alert(t.task.attachmentError);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await taskService.deleteAttachment(task.id, attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch {
      alert(t.task.attachmentDeleteError);
    }
  };

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('pt-BR')
    : null;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border p-4 shadow-sm transition-all ${
        task.completed
          ? 'border-green-200 dark:border-green-800 opacity-75'
          : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
      }`}
      data-testid="task-card"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => !task.completed && onComplete(task.id)}
          disabled={task.completed}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 dark:border-gray-500 hover:border-blue-500'
          }`}
          aria-label={task.completed ? t.task.taskCompleted : t.task.markComplete}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-gray-800 dark:text-white truncate ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
          )}
          {formattedDate && (
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 inline-block">{t.task.deadline}: {formattedDate}</span>
          )}
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {!task.completed && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              aria-label={t.task.editTask}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            aria-label={t.task.deleteTask}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Attachments section */}
      {(attachments.length > 0 || !task.completed) && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((att) => (
                <div key={att.id} className="relative group">
                  {att.mimetype.startsWith('image/') ? (
                    <a href={att.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={att.url}
                        alt={att.originalName}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                    </a>
                  ) : (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-2 py-1.5 rounded-lg max-w-36"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate">{att.originalName}</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteAttachment(att.id)}
                    className="absolute -top-1.5 -right-1.5 hidden group-hover:flex w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full items-center justify-center shadow-sm"
                    aria-label={t.task.deleteAttachment}
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {!task.completed && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <span>{t.task.uploading}</span>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>{t.task.attach}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {task.completed && (
        <span className="mt-2 inline-block text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
          {t.task.completed}
        </span>
      )}
    </div>
  );
}
