# Sistema de Gerenciamento de Tarefas

Aplicação full-stack de gerenciamento de tarefas pessoais com autenticação JWT.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express |
| Banco de Dados | PostgreSQL 15 |
| Auth | JWT + bcrypt |
| Container | Docker + Docker Compose |
| Testes | Jest (backend) + Vitest + RTL (frontend) |
| CI/CD | GitHub Actions |

---

## Rodando Localmente com Docker

### Pré-requisitos
- [Docker](https://www.docker.com/) instalado

### 1. Clone o repositório
```bash
git clone https://github.com/joaovksp7/sistema-gerenciamento-tarefas.git
cd sistema-gerenciamento-tarefas
```

### 2. Suba tudo com um comando
```bash
docker-compose up --build
```

- Frontend: http://localhost:80
- Backend: http://localhost:3000
- Swagger (docs API): http://localhost:3000/api-docs

---

## Rodando sem Docker (desenvolvimento)

### Backend

```bash
cd backend
cp .env.example .env   # configure as variáveis
npm install

# Subir apenas o banco com Docker
docker-compose -f backend/docker-compose.yml up -d

npm start              # http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev            # http://localhost:5173
```

---

## Testes

### Backend
```bash
cd backend
npm test               # Jest
npm test -- --coverage # Com cobertura (meta: >70%)
```

### Frontend
```bash
cd frontend
npm run test           # Vitest
npm run test:coverage  # Com cobertura
```

---

## API Endpoints

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/api/auth/register` | - | Cadastrar usuário |
| POST | `/api/auth/login` | - | Login e retorno do JWT |
| GET | `/api/tasks` | JWT | Listar tarefas do usuário |
| POST | `/api/tasks` | JWT | Criar tarefa |
| PATCH | `/api/tasks/:id` | JWT | Atualizar tarefa |
| PATCH | `/api/tasks/:id/complete` | JWT | Marcar como concluída |
| DELETE | `/api/tasks/:id` | JWT | Deletar tarefa |

Documentação interativa disponível em: **http://localhost:3000/api-docs**

---

## Estrutura do Projeto

```
sistema-gerenciamento-tarefas/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── docs/
│   │   └── __tests__/
│   ├── Dockerfile
│   ├── CLAUDE.md
│   └── AGENTS.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── docs/
│   │   └── __tests__/
│   ├── Dockerfile
│   ├── CLAUDE.md
│   └── AGENTS.md
├── docker-compose.yml
└── .github/
    └── workflows/
        └── ci.yml
```

---

## Deploy

### Frontend → Vercel
1. Importe o repositório no [Vercel](https://vercel.com)
2. Configure `Root Directory` como `frontend`
3. Adicione a variável de ambiente: `VITE_API_URL=https://sua-api.railway.app/api`

### Backend → Railway
1. Importe o repositório no [Railway](https://railway.app)
2. Configure `Root Directory` como `backend`
3. Adicione as variáveis de ambiente do `.env.example`
4. Crie um serviço PostgreSQL e conecte via `DATABASE_URL`
