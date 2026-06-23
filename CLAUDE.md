# CLAUDE.md — Sistema de Gerenciamento de Tarefas (Projeto Piloto BahTech)

Guia único para agentes de IA (Claude Code, Codex, etc.) trabalharem neste repositório.
Monorepo com dois pacotes: **`backend/`** (Node.js + Express + PostgreSQL) e **`frontend/`** (React + Vite + TypeScript).

Arquiteturas técnicas detalhadas:
- Backend: [`backend/src/docs/architecture.md`](backend/src/docs/architecture.md)
- Frontend: [`frontend/src/docs/architecture.md`](frontend/src/docs/architecture.md)

---

## Como rodar (modo Docker — padrão do projeto)

```bash
# Na raiz do projeto — sobe backend + frontend + postgres
docker compose up -d
docker compose down          # desliga tudo
```

| Serviço | Endereço | Porta |
|---------|----------|-------|
| Frontend (a aplicação) | http://localhost | 80 |
| Backend / API | http://localhost:3000 | 3000 |
| PostgreSQL | localhost | 5432 |

> ⚠️ Não rodar `npm start` no backend enquanto o container `tasks_backend` estiver no ar — os dois disputam a porta 3000 (`EADDRINUSE`). Use **ou** Docker **ou** local, nunca os dois.

---

## Backend (`backend/`)

API REST de gerenciamento de tarefas pessoais. Autenticação JWT + bcrypt, PostgreSQL via Docker.

### Comandos
```bash
docker-compose up -d      # subir o banco (quando rodando isolado)
npm install               # instalar dependências
npm start                 # iniciar o servidor local (porta 3000)
npm test                  # rodar os testes
npm run test:coverage     # cobertura de testes
```

### Padrões
- **Arquitetura em camadas**: Routes → Middlewares → Controllers → Services → PostgreSQL
- **CommonJS** (`require`/`module.exports`) — não usar `import`/`export`
- **Sem ORM**: queries SQL puras via `pg` (pool de conexão)
- **Variáveis de ambiente**: sempre via `process.env.X` — nunca hardcoded
- **Nomenclatura**: funções nos services em português (ex: `criarTarefa`, `listarTarefas`)
- **Isolamento por usuário**: toda query de tarefa inclui `WHERE "userId" = $x`

### O que NÃO fazer
- Não commitar `.env` (está no `.gitignore`)
- Não usar `status` como coluna de tarefa — a correta é `completed` (boolean)
- Não exportar `{ router }` nas rotas — exportar `router` diretamente
- Não hardcodar `JWT_SECRET` ou credenciais do banco

### Arquivos principais
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/index.js` | Ponto de entrada da aplicação |
| `src/database.js` | Pool de conexão com o PostgreSQL |
| `src/criarTabelas.js` | Criação automática das tabelas na inicialização |
| `src/services/taskService.js` | Lógica de tarefas + queries |
| `src/services/userService.js` | Registro e autenticação de usuários |
| `src/docs/swagger.js` | Definição OpenAPI — documentação em `/api-docs` |

---

## Frontend (`frontend/`)

SPA de gerenciamento de tarefas: autenticação JWT, dashboard, CRUD completo, filtros por status e chat.

### Comandos
```bash
npm run dev           # servidor de desenvolvimento (porta 5173)
npm run build         # build de produção (TypeScript + Vite)
npm run test          # testes com Vitest
npm run test:coverage # testes com cobertura
npx tsc --noEmit      # verificação de tipos sem compilar
```

### Regras importantes
- `verbatimModuleSyntax: true` — imports de tipo devem usar `import type`
- `noUnusedLocals` e `noUnusedParameters: true` — não deixe variáveis não usadas
- Componentes em `.tsx`, serviços em `.ts`
- JWT é armazenado no `localStorage` via `authService`
- O interceptor em `src/services/api.ts` injeta o token em todas as requisições — **não editar sem entender os interceptors de auth**
- Não usar `any` — defina tipos explícitos em `src/types/index.ts`

### Padrões de código
- Componentes: `function MinhaFuncao()` (não arrow functions no topo)
- Tipos compartilhados em `src/types/index.ts`
- Serviços de API em `src/services/`
- Estado global de auth via `AuthContext` (`useAuth()` hook)

### Testes
- Framework: Vitest + React Testing Library
- Setup em `src/__tests__/setup.ts`
- Mocks de rotas com `MemoryRouter` do `react-router-dom`; mocks de funções com `vi.fn()`
- Sempre rodar `npx tsc --noEmit` e `npm run test` após editar componentes

### Endpoints da API consumidos
A API está em `http://localhost:3000/api`.

| Método | Rota | Ação |
|--------|------|------|
| POST | /auth/register | Cadastrar usuário |
| POST | /auth/login | Autenticar e receber JWT |
| GET | /tasks | Listar tarefas do usuário |
| POST | /tasks | Criar tarefa |
| PATCH | /tasks/:id | Atualizar tarefa |
| PATCH | /tasks/:id/complete | Marcar como concluída |
| DELETE | /tasks/:id | Deletar tarefa |

---

## Agentes & Fluxo de Trabalho

### Agente de Desenvolvimento (Claude Code / Codex)
- Implementa e corrige rotas, controllers, services, middlewares e componentes
- Mantém a arquitetura em camadas e os padrões descritos acima
- Garante que queries de tarefas filtrem por `userId` e que nada de segredo seja hardcoded
- **Não** altera variáveis de ambiente, faz push remoto ou mexe no `docker-compose.yml` sem aprovação explícita

### Agente de Revisão (Code Reviewer)
Checklist:
- [ ] Nenhum segredo hardcoded
- [ ] `.env` não está sendo commitado
- [ ] Toda rota protegida usa o `authMiddleware`
- [ ] Toda query de tarefa filtra por `userId`
- [ ] Cobertura de testes acima de 70%
- [ ] Commits seguem o padrão semântico (`feat:`, `fix:`, `chore:`, etc.)

### Desenvolvedor Humano (João)
- Aprova cada etapa antes da implementação e define prioridades/escopo
- Testa manualmente via Swagger (`/api-docs`) ou Thunder Client
- Gerencia as credenciais reais no `.env`

### Fluxo
```
João define o que fazer
        │
        ▼
Agente implementa (uma etapa por vez, com aprovação)
        │
        ▼
João valida no Swagger / Thunder Client / app
        │
        ▼
Commit semântico + próxima etapa
```
