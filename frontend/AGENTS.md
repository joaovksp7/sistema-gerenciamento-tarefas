# AGENTS.md — Frontend

Instruções para agentes autônomos (Codex, Claude, etc.) que trabalham neste frontend.

## Referência de Arquitetura

Leia [src/docs/architecture.md](src/docs/architecture.md) antes de qualquer tarefa.

## O Que Este Frontend Faz

SPA de gerenciamento de tarefas pessoais com:
- Autenticação via JWT (login/registro)
- Dashboard com listagem de tarefas
- CRUD completo (criar, editar, completar, deletar)
- Filtros por status (todas / pendentes / concluídas)

## Backend

A API está em `http://localhost:3000/api`. Endpoints relevantes:

| Método | Rota | Ação |
|--------|------|------|
| POST | /auth/register | Cadastrar usuário |
| POST | /auth/login | Autenticar e receber JWT |
| GET | /tasks | Listar tarefas do usuário |
| POST | /tasks | Criar tarefa |
| PATCH | /tasks/:id | Atualizar tarefa |
| PATCH | /tasks/:id/complete | Marcar como concluída |
| DELETE | /tasks/:id | Deletar tarefa |

## Regras para Agentes

1. **Sempre verificar tipos** com `npx tsc --noEmit` após editar
2. **Sempre rodar testes** com `npm run test` após mudanças em componentes
3. **Nunca editar** `src/services/api.ts` sem entender os interceptors de auth
4. **import type** obrigatório para imports somente de tipos
5. Não usar `any` — defina tipos explícitos em `src/types/index.ts`
