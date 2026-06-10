# AGENTS.md — Backend

Descreve os agentes envolvidos no desenvolvimento deste backend e suas responsabilidades.
Consulte [`src/docs/architecture.md`](src/docs/architecture.md) para a arquitetura técnica completa.

## Agentes do Projeto

### Agente de Desenvolvimento (Claude Code)
Responsável pela implementação do código do backend.

**Escopo de atuação:**
- Implementar e corrigir rotas, controllers, services e middlewares
- Manter a arquitetura em camadas descrita em `src/docs/architecture.md`
- Garantir que queries de tarefas sempre filtrem por `userId`
- Nunca hardcodar segredos — usar sempre `process.env`
- Seguir o padrão CommonJS do projeto

**O que NÃO é escopo deste agente:**
- Alterar variáveis de ambiente sem instrução explícita
- Fazer push para repositórios remotos sem aprovação
- Modificar o `docker-compose.yml` sem necessidade clara

### Agente de Revisão (Code Reviewer)
Responsável por revisar pull requests e garantir qualidade.

**Checklist de revisão:**
- [ ] Nenhum segredo hardcoded no código
- [ ] `.env` não está sendo commitado
- [ ] Toda rota protegida usa o `authMiddleware`
- [ ] Toda query de tarefa filtra por `userId`
- [ ] Cobertura de testes acima de 70%
- [ ] Commits seguem o padrão semântico (`feat:`, `fix:`, `chore:`, etc.)

### Desenvolvedor Humano (João)
Proprietário do projeto e responsável pelas decisões de produto.

**Responsabilidades:**
- Aprovar cada etapa antes da implementação
- Definir prioridades e escopo
- Realizar testes manuais via Swagger (`/api-docs`) ou Thunder Client
- Gerenciar credenciais reais no arquivo `.env`

## Fluxo de Trabalho

```
João define o que fazer
        │
        ▼
Claude Code implementa (uma etapa por vez, com aprovação)
        │
        ▼
João valida no Swagger ou Thunder Client
        │
        ▼
Commit semântico + próxima etapa
```

## Referências

- Guia para agentes IA: [`CLAUDE.md`](CLAUDE.md)
- Arquitetura técnica: [`src/docs/architecture.md`](src/docs/architecture.md)
