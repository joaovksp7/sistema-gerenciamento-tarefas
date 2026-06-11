# CLAUDE.md — Frontend

Guia para agentes de IA trabalharem neste projeto de frontend.

## Arquitetura

Consulte [src/docs/architecture.md](src/docs/architecture.md) para entender a estrutura completa do projeto.

## Comandos Essenciais

```bash
npm run dev           # Inicia o servidor de desenvolvimento (porta 5173)
npm run build         # Build de produção (TypeScript + Vite)
npm run test          # Executa testes com Vitest
npm run test:coverage # Testes com relatório de cobertura
npx tsc --noEmit      # Verificação de tipos sem compilar
```

## Regras Importantes

- `verbatimModuleSyntax: true` — todos os imports de tipo devem usar `import type`
- `noUnusedLocals` e `noUnusedParameters: true` — não deixe variáveis não usadas
- Todos os componentes são em TypeScript (`.tsx`), serviços em `.ts`
- JWT é armazenado no `localStorage` via `authService`
- O interceptor em `src/services/api.ts` injeta o token em todas as requisições

## Padrões de Código

- Componentes: `function MinhaFuncao()` (não arrow functions no topo)
- Tipos compartilhados ficam em `src/types/index.ts`
- Serviços de API ficam em `src/services/`
- Estado global de auth via `AuthContext` (`useAuth()` hook)

## Testes

- Framework: Vitest + React Testing Library
- Setup em `src/__tests__/setup.ts`
- Mocks de rotas com `MemoryRouter` do `react-router-dom`
- Mocks de funções com `vi.fn()`
