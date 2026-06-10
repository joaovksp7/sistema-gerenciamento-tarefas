# Arquitetura do Backend — Sistema de Gerenciamento de Tarefas

> Este arquivo é o ponto de entrada da documentação técnica do backend.
> Referenciado por [`CLAUDE.md`](../../CLAUDE.md) e [`AGENTS.md`](../../AGENTS.md) na raiz do projeto.

## Visão Geral

API REST construída com **Node.js + Express**, persistência em **PostgreSQL** (via Docker) e autenticação por **JWT + bcrypt**.

```
Cliente (Frontend / Thunder Client / Swagger)
        │
        ▼
   [ Routes ]        → define os endpoints e aplica middlewares
        │
        ▼
   [ Middlewares ]   → valida o token JWT antes de chegar no controller
        │
        ▼
   [ Controllers ]   → valida o payload da requisição e formata a resposta
        │
        ▼
   [ Services ]      → regras de negócio + queries ao banco de dados
        │
        ▼
   [ PostgreSQL ]    → armazenamento persistente (Docker)
```

## Estrutura de Pastas

```
backend/
├── .env                  # Variáveis de ambiente (não vai ao git)
├── .env.example          # Modelo das variáveis (vai ao git)
├── package.json
├── docker-compose.yml    # Sobe o PostgreSQL localmente
└── src/
    ├── index.js          # Ponto de entrada: carrega dotenv, middlewares e rotas
    ├── database.js       # Configuração do pool de conexão com o PostgreSQL
    ├── criarTabelas.js   # Cria as tabelas users e tasks na inicialização
    ├── controllers/
    │   ├── authController.js   # Valida dados de registro e login
    │   └── taskController.js   # Valida dados do CRUD de tarefas
    ├── middlewares/
    │   └── authMiddleware.js   # Verifica o token JWT em rotas protegidas
    ├── routes/
    │   ├── authRoutes.js       # POST /api/auth/register e /login
    │   └── taskRoutes.js       # GET, POST, PATCH, DELETE /api/tasks
    ├── services/
    │   ├── userService.js      # Registro e autenticação de usuários
    │   └── taskService.js      # CRUD completo de tarefas
    └── docs/
        ├── architecture.md     # Este arquivo
        └── swagger.js          # Definição OpenAPI 3.0 (acessível em /api-docs)
```

## Banco de Dados

### Tabela `users`
| Coluna         | Tipo        | Descrição                    |
|----------------|-------------|------------------------------|
| id             | UUID (PK)   | Gerado automaticamente       |
| email          | VARCHAR     | Único, obrigatório           |
| name           | VARCHAR     | Obrigatório                  |
| passwordHash   | VARCHAR     | Hash bcrypt da senha         |
| createdAt      | TIMESTAMP   | Preenchido automaticamente   |

### Tabela `tasks`
| Coluna      | Tipo        | Descrição                          |
|-------------|-------------|------------------------------------|
| id          | UUID (PK)   | Gerado automaticamente             |
| userId      | UUID (FK)   | Referência ao usuário dono         |
| title       | VARCHAR     | Obrigatório                        |
| description | TEXT        | Opcional                           |
| completed   | BOOLEAN     | Padrão: false                      |
| dueDate     | DATE        | Opcional                           |
| createdAt   | TIMESTAMP   | Preenchido automaticamente         |
| updatedAt   | TIMESTAMP   | Atualizado a cada PATCH            |

## Endpoints

| Método | Rota                        | Auth | Descrição                  |
|--------|-----------------------------|------|----------------------------|
| POST   | /api/auth/register          | Não  | Cadastrar usuário          |
| POST   | /api/auth/login             | Não  | Login — retorna JWT        |
| GET    | /api/tasks                  | Sim  | Listar tarefas do usuário  |
| POST   | /api/tasks                  | Sim  | Criar tarefa               |
| PATCH  | /api/tasks/:id              | Sim  | Atualizar tarefa           |
| PATCH  | /api/tasks/:id/complete     | Sim  | Marcar como concluída      |
| DELETE | /api/tasks/:id              | Sim  | Deletar tarefa             |
| GET    | /api-docs                   | Não  | Documentação Swagger UI    |

## Decisões de Design

- **`COALESCE` no UPDATE**: permite atualizar só os campos enviados, sem sobrescrever os demais.
- **`WHERE userId = $x` em toda query de tarefa**: garante isolamento entre usuários — nenhum usuário acessa dados de outro.
- **`dotenv` carregado na primeira linha do `index.js`**: garante que todas as variáveis de ambiente estejam disponíveis antes de qualquer módulo ser importado.
- **Nomenclatura em português nos services**: padrão adotado desde o início do projeto (`registarUtilizador`, `autenticarUtilizador`) — mantido para consistência.
