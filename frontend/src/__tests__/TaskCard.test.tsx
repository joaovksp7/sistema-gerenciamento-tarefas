import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TaskCard } from '../components/TaskCard';
import { Task } from '../types';

const mockTask: Task = {
  id: '1',
  title: 'Estudar React',
  description: 'Revisar hooks e contexto',
  completed: false,
  userId: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('TaskCard', () => {
  it('renderiza o título da tarefa', () => {
    render(
      <TaskCard
        task={mockTask}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Estudar React')).toBeInTheDocument();
  });

  it('renderiza a descrição da tarefa', () => {
    render(
      <TaskCard
        task={mockTask}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Revisar hooks e contexto')).toBeInTheDocument();
  });

  it('chama onComplete ao clicar no botão de concluir', () => {
    const onComplete = vi.fn();
    render(
      <TaskCard task={mockTask} onComplete={onComplete} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /marcar como concluída/i }));
    expect(onComplete).toHaveBeenCalledWith('1');
  });

  it('chama onDelete ao clicar no botão de deletar', () => {
    const onDelete = vi.fn();
    render(
      <TaskCard task={mockTask} onComplete={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />
    );
    fireEvent.click(screen.getByRole('button', { name: /deletar/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('chama onEdit ao clicar no botão de editar', () => {
    const onEdit = vi.fn();
    render(
      <TaskCard task={mockTask} onComplete={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('exibe badge "Concluída" quando task.completed é true', () => {
    render(
      <TaskCard
        task={{ ...mockTask, completed: true }}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Concluída')).toBeInTheDocument();
  });

  it('não exibe botão de editar quando tarefa está concluída', () => {
    render(
      <TaskCard
        task={{ ...mockTask, completed: true }}
        onComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
  });
});
