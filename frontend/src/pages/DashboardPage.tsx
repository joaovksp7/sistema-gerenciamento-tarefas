import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Task, TaskFilter } from '../types';
import { taskService } from '../services/taskService';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { TaskFilters } from '../components/TaskFilters';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } catch {
      // silently fail — token interceptor redireciona se 401
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (data: { title: string; description?: string; dueDate?: string }) => {
    const task = await taskService.create(data);
    setTasks((prev) => [task, ...prev]);
    setShowForm(false);
  };

  const handleUpdate = async (data: { title: string; description?: string; dueDate?: string }) => {
    if (!editingTask) return;
    const updated = await taskService.update(editingTask.id, data);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTask(null);
  };

  const handleComplete = async (id: string) => {
    const updated = await taskService.complete(id);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja deletar esta tarefa?')) return;
    await taskService.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Minhas Tarefas</h1>
            <p className="text-xs text-gray-500">Olá, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Filtros + Botão novo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TaskFilters current={filter} onChange={setFilter} counts={counts} />
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova tarefa
          </button>
        </div>

        {/* Lista de tarefas */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando tarefas...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              {filter === 'all' ? 'Nenhuma tarefa ainda. Crie a primeira!' : `Nenhuma tarefa ${filter === 'pending' ? 'pendente' : 'concluída'}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onEdit={setEditingTask}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modais */}
      {showForm && (
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}
      {editingTask && (
        <TaskForm
          onSubmit={handleUpdate}
          onCancel={() => setEditingTask(null)}
          initialData={editingTask}
        />
      )}
    </div>
  );
}
