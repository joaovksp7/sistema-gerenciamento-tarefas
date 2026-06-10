process.env.JWT_SECRET = 'chave_de_teste';
process.env.PORT = '3002';

jest.mock('../services/taskService');
jest.mock('../database', () => ({ pool: { query: jest.fn() }, conectarBanco: jest.fn() }));
jest.mock('../criarTabelas', () => ({ criarTabelas: jest.fn() }));
jest.mock('../docs/swagger', () => ({}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../index');
const taskService = require('../services/taskService');

const token = jwt.sign({ id: 'uuid-usuario' }, process.env.JWT_SECRET);
const auth = { Authorization: `Bearer ${token}` };

const tarefaMock = {
  id: 'uuid-tarefa',
  title: 'Estudar Node.js',
  description: 'Ler a documentação',
  completed: false,
  dueDate: null,
  userId: 'uuid-usuario',
  createdAt: new Date().toISOString(),
};

describe('GET /api/tasks', () => {
  it('retorna 200 com a lista de tarefas do usuário', async () => {
    taskService.listarTarefas.mockResolvedValue([tarefaMock]);

    const res = await request(app).get('/api/tasks').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe('Estudar Node.js');
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/tasks', () => {
  it('retorna 201 ao criar uma tarefa válida', async () => {
    taskService.criarTarefa.mockResolvedValue(tarefaMock);

    const res = await request(app).post('/api/tasks').set(auth).send({
      title: 'Estudar Node.js',
      description: 'Ler a documentação',
    });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe('Estudar Node.js');
  });

  it('retorna 400 quando o título está ausente', async () => {
    const res = await request(app).post('/api/tasks').set(auth).send({ description: 'Sem título' });

    expect(res.status).toBe(400);
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Tarefa' });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('retorna 200 ao atualizar uma tarefa existente', async () => {
    taskService.atualizarTarefa.mockResolvedValue({ ...tarefaMock, title: 'Título novo' });

    const res = await request(app).patch('/api/tasks/uuid-tarefa').set(auth).send({ title: 'Título novo' });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Título novo');
  });

  it('retorna 404 quando a tarefa não existe', async () => {
    taskService.atualizarTarefa.mockResolvedValue(null);

    const res = await request(app).patch('/api/tasks/uuid-inexistente').set(auth).send({ title: 'X' });

    expect(res.status).toBe(404);
  });

  it('retorna 400 quando nenhum campo é enviado', async () => {
    const res = await request(app).patch('/api/tasks/uuid-tarefa').set(auth).send({});

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/tasks/:id/complete', () => {
  it('retorna 200 ao marcar a tarefa como concluída', async () => {
    taskService.concluirTarefa.mockResolvedValue({ ...tarefaMock, completed: true });

    const res = await request(app).patch('/api/tasks/uuid-tarefa/complete').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.task.completed).toBe(true);
  });

  it('retorna 404 quando a tarefa não existe', async () => {
    taskService.concluirTarefa.mockResolvedValue(null);

    const res = await request(app).patch('/api/tasks/uuid-inexistente/complete').set(auth);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('retorna 200 ao deletar uma tarefa existente', async () => {
    taskService.deletarTarefa.mockResolvedValue({ id: 'uuid-tarefa' });

    const res = await request(app).delete('/api/tasks/uuid-tarefa').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Tarefa deletada com sucesso!');
  });

  it('retorna 404 quando a tarefa não existe', async () => {
    taskService.deletarTarefa.mockResolvedValue(null);

    const res = await request(app).delete('/api/tasks/uuid-inexistente').set(auth);

    expect(res.status).toBe(404);
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app).delete('/api/tasks/uuid-tarefa');
    expect(res.status).toBe(401);
  });
});
