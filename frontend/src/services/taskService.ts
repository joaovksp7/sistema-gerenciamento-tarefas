import api from './api';
import type { Task } from '../types';

interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
}

export const taskService = {
  async getAll(): Promise<Task[]> {
    const { data } = await api.get<{ tasks: Task[] }>('/tasks');
    return data.tasks;
  },

  async create(taskData: CreateTaskData): Promise<Task> {
    const { data } = await api.post<{ task: Task }>('/tasks', taskData);
    return data.task;
  },

  async update(id: string, taskData: UpdateTaskData): Promise<Task> {
    const { data } = await api.patch<{ task: Task }>(`/tasks/${id}`, taskData);
    return data.task;
  },

  async complete(id: string): Promise<Task> {
    const { data } = await api.patch<{ task: Task }>(`/tasks/${id}/complete`);
    return data.task;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
