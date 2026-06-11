import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('pt-BR')
    : null;

  return (
    <div
      className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${
        task.completed ? 'border-green-200 opacity-75' : 'border-gray-200 hover:shadow-md'
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
              : 'border-gray-300 hover:border-blue-500'
          }`}
          aria-label={task.completed ? 'Tarefa concluída' : 'Marcar como concluída'}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-gray-800 truncate ${task.completed ? 'line-through text-gray-400' : ''}`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
          )}
          {formattedDate && (
            <span className="text-xs text-gray-400 mt-1 inline-block">Prazo: {formattedDate}</span>
          )}
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {!task.completed && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Editar tarefa"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Deletar tarefa"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.completed && (
        <span className="mt-2 inline-block text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          Concluída
        </span>
      )}
    </div>
  );
}
