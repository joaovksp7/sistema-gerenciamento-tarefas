process.env.JWT_SECRET = 'chave_de_teste';
process.env.PORT = '3001';

jest.mock('../services/userService');
jest.mock('../database', () => ({ pool: { query: jest.fn() }, conectarBanco: jest.fn() }));
jest.mock('../criarTabelas', () => ({ criarTabelas: jest.fn() }));
jest.mock('../docs/swagger', () => ({}));

const request = require('supertest');
const app = require('../index');
const userService = require('../services/userService');

describe('POST /api/auth/register', () => {
  it('retorna 201 ao cadastrar um usuário válido', async () => {
    userService.registarUtilizador.mockResolvedValue({
      id: 'uuid-1',
      name: 'João',
      email: 'joao@email.com',
      createdAt: new Date().toISOString(),
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'João',
      email: 'joao@email.com',
      password: 'senha123',
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Utilizador registado com sucesso!');
    expect(res.body.user.email).toBe('joao@email.com');
  });

  it('retorna 400 quando campos obrigatórios estão ausentes', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'joao@email.com' });

    expect(res.status).toBe(400);
  });

  it('retorna 400 quando o e-mail já está em uso', async () => {
    userService.registarUtilizador.mockRejectedValue(new Error('Este e-mail já está em uso.'));

    const res = await request(app).post('/api/auth/register').send({
      name: 'João',
      email: 'joao@email.com',
      password: 'senha123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Este e-mail já está em uso.');
  });
});

describe('POST /api/auth/login', () => {
  it('retorna 200 e um token JWT ao fazer login com credenciais válidas', async () => {
    userService.autenticarUtilizador.mockResolvedValue({
      id: 'uuid-1',
      name: 'João',
      email: 'joao@email.com',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'joao@email.com',
      password: 'senha123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('joao@email.com');
  });

  it('retorna 400 quando campos estão ausentes', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'joao@email.com' });

    expect(res.status).toBe(400);
  });

  it('retorna 401 com credenciais incorretas', async () => {
    userService.autenticarUtilizador.mockRejectedValue(new Error('E-mail ou palavra-passe incorretos.'));

    const res = await request(app).post('/api/auth/login').send({
      email: 'joao@email.com',
      password: 'senha_errada',
    });

    expect(res.status).toBe(401);
  });
});
