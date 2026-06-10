const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gerenciamento de Tarefas',
      version: '1.0.0',
      description: 'API REST para gerenciamento de tarefas pessoais — Projeto Piloto BahTech',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Estudar Node.js' },
            description: { type: 'string', example: 'Ler documentação do Express' },
            completed: { type: 'boolean', example: false },
            dueDate: { type: 'string', format: 'date', example: '2026-06-20', nullable: true },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Autenticação'],
          summary: 'Cadastrar novo usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'João Silva' },
                    email: { type: 'string', example: 'joao@email.com' },
                    password: { type: 'string', example: 'senha123' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Usuário cadastrado com sucesso' },
            400: { description: 'Dados inválidos ou e-mail já em uso' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Autenticação'],
          summary: 'Fazer login e obter token JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'joao@email.com' },
                    password: { type: 'string', example: 'senha123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login realizado — retorna o token JWT' },
            401: { description: 'E-mail ou senha incorretos' },
          },
        },
      },
      '/api/tasks': {
        get: {
          tags: ['Tarefas'],
          summary: 'Listar todas as tarefas do usuário logado',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Lista de tarefas',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    },
                  },
                },
              },
            },
            401: { description: 'Token não fornecido' },
          },
        },
        post: {
          tags: ['Tarefas'],
          summary: 'Criar nova tarefa',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string', example: 'Estudar Node.js' },
                    description: { type: 'string', example: 'Ler documentação do Express' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Tarefa criada com sucesso' },
            400: { description: 'Título obrigatório' },
            401: { description: 'Token não fornecido' },
          },
        },
      },
      '/api/tasks/{id}': {
        patch: {
          tags: ['Tarefas'],
          summary: 'Atualizar título, descrição ou data de uma tarefa',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Novo título' },
                    description: { type: 'string', example: 'Nova descrição' },
                    dueDate: { type: 'string', format: 'date', example: '2026-06-30' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Tarefa atualizada' },
            404: { description: 'Tarefa não encontrada' },
            401: { description: 'Token não fornecido' },
          },
        },
        delete: {
          tags: ['Tarefas'],
          summary: 'Deletar uma tarefa',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Tarefa deletada com sucesso' },
            404: { description: 'Tarefa não encontrada' },
            401: { description: 'Token não fornecido' },
          },
        },
      },
      '/api/tasks/{id}/complete': {
        patch: {
          tags: ['Tarefas'],
          summary: 'Marcar tarefa como concluída',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Tarefa marcada como concluída' },
            404: { description: 'Tarefa não encontrada' },
            401: { description: 'Token não fornecido' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
