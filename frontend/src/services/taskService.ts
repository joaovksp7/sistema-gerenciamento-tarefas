import api from './api';
import type { Task, Attachment } from '../types';

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

  async getAttachments(taskId: string): Promise<Attachment[]> {
    const { data } = await api.get<{ attachments: Attachment[] }>(`/tasks/${taskId}/attachments`);
    return data.attachments;
  },

  async uploadAttachment(taskId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ attachment: Attachment }>(
      `/tasks/${taskId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.attachment;
  },

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  },
};
