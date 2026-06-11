# Arquitetura do Frontend

## Visão Geral

SPA (Single Page Application) em React 18 + TypeScript construída com Vite. Comunica com o backend via API REST autenticada por JWT.

## Stack

| Tecnologia | Versão | Propósito |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Tipagem estática |
| Vite | 8 | Build tool / dev server |
| Tailwind CSS | 3 | Estilização utilitária |
| React Router | 7 | Roteamento SPA |
| Axios | 1 | Cliente HTTP |
| Vitest | 4 | Testes unitários |
| React Testing Library | 16 | Testes de componentes |

## Estrutura de Pastas

```
src/
├── __tests__/          # Testes (colocados junto ao setup)
├── components/         # Componentes reutilizáveis
│   ├── PrivateRoute.tsx   # Proteção de rotas autenticadas
│   ├── TaskCard.tsx       # Card de exibição de tarefa
│   ├── TaskFilters.tsx    # Filtros de status
│   └── TaskForm.tsx       # Modal de criação/edição
├── context/
│   └── AuthContext.tsx    # Estado global de autenticação
├── docs/               # Esta documentação
├── pages/
│   ├── DashboardPage.tsx  # Tela principal com CRUD
│   ├── LoginPage.tsx      # Autenticação
│   └── RegisterPage.tsx   # Cadastro
├── services/
│   ├── api.ts             # Instância Axios + interceptors
│   ├── authService.ts     # Chamadas de auth + localStorage
│   └── taskService.ts     # CRUD de tarefas
├── types/
│   └── index.ts           # Interfaces TypeScript
├── App.tsx             # Rotas principais
├── index.css           # Tailwind base
└── main.tsx            # Entry point
```

## Fluxo de Autenticação

```
Login/Register → AuthContext.login() → authService.saveSession(token, user)
                                     → localStorage.setItem('token')
                                     → navigate('/dashboard')

PrivateRoute → useAuth().isAuthenticated → redireciona /login se falso

api.ts interceptor → injeta Authorization: Bearer <token> em toda requisição
                   → redireciona /login em 401/403
```

## Fluxo de Dados (Dashboard)

```
DashboardPage
  ├── taskService.getAll() → GET /api/tasks
  ├── taskService.create() → POST /api/tasks
  ├── taskService.update() → PATCH /api/tasks/:id
  ├── taskService.complete() → PATCH /api/tasks/:id/complete
  └── taskService.delete() → DELETE /api/tasks/:id
```

## Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:3000/api  # URL base da API
```

## Scripts

```bash
npm run dev           # Dev server em http://localhost:5173
npm run build         # Build de produção
npm run test          # Testes com Vitest
npm run test:coverage # Cobertura de testes
```
