# CLAUDE.md — Backend

Guia para agentes IA trabalharem neste repositório.
Consulte [`src/docs/architecture.md`](src/docs/architecture.md) para a documentação técnica completa.

## Contexto do Projeto

Backend de um sistema de gerenciamento de tarefas pessoais — Projeto Piloto BahTech (Semana 1 de 3).
API REST com Node.js + Express, PostgreSQL via Docker, autenticação JWT + bcrypt.

## Comandos Essenciais

```bash
# Subir o banco de dados
docker-compose up -d

# Instalar dependências
npm install

# Iniciar o servidor (porta 3000)
npm start

# Rodar os testes
npm test

# Ver cobertura de testes
npm run test:coverage
```

## Padrões do Projeto

- **Arquitetura em camadas**: Routes → Middlewares → Controllers → Services → PostgreSQL
- **CommonJS** (`require`/`module.exports`) — não usar `import`/`export`
- **Sem ORM**: queries SQL puras via `pg` (pool de conexão)
- **Variáveis de ambiente**: sempre via `process.env.X` — nunca hardcoded
- **Nomenclatura**: funções nos services usam português (ex: `criarTarefa`, `listarTarefas`)
- **Isolamento por usuário**: toda query de tarefa inclui `WHERE "userId" = $x`

## O que NÃO fazer

- Não commitar o arquivo `.env` (está no `.gitignore`)
- Não usar `status` como coluna de tarefa — a coluna correta é `completed` (boolean)
- Não exportar `{ router }` nas rotas — exportar `router` diretamente
- Não hardcodar `JWT_SECRET` ou credenciais do banco no código

## Arquivos Principais

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/index.js` | Ponto de entrada da aplicação |
| `src/database.js` | Pool de conexão com o PostgreSQL |
| `src/criarTabelas.js` | Criação automática das tabelas na inicialização |
| `src/services/taskService.js` | Toda lógica de tarefas + queries |
| `src/services/userService.js` | Registro e autenticação de usuários |
| `src/docs/swagger.js` | Definição OpenAPI — documentação em `/api-docs` |

## Referências

- Arquitetura detalhada: [`src/docs/architecture.md`](src/docs/architecture.md)
- Agentes e responsabilidades: [`AGENTS.md`](AGENTS.md)
