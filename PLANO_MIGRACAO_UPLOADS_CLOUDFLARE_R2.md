# Plano — Migrar Uploads de `/uploads` (disco) para Cloudflare R2

> Objetivo: parar de salvar anexos de tarefas e arquivos de chat no disco do servidor
> (`backend/uploads/`), que é **efêmero no Render** e some a cada redeploy/restart/hibernação.
> Os arquivos passam a viver no **Cloudflare R2** (object storage), persistindo entre deploys.
>
> Criado em: 2026-06-16

---

## 1. Por que isso é necessário

Hoje os arquivos são salvos **no disco do servidor** e o banco guarda **só os metadados**:

- **Upload** (multer `diskStorage`) grava em `backend/uploads/`:
  - Tarefas: `backend/src/routes/taskRoutes.js`
  - Chat: `backend/src/routes/chatRoutes.js`
- **Banco** salva apenas `filename, originalName, mimetype, size` (não os bytes):
  - `task_attachments` (via `attachmentService.js`)
  - `chat_messages` (via `chat/chatService.js`)
- **Servir o arquivo**: estático em `/uploads` (`index.js`), e o frontend monta a URL como
  `BACKEND/uploads/<filename>` (`TaskCard.tsx`, `chat/MessageBubble.tsx`).

**Problema:** o backend roda no **Render plano free**, cujo disco é **efêmero**. A cada
redeploy, restart ou saída da hibernação, `backend/uploads/` é **zerado**. O banco continua
apontando para `filename`, mas o arquivo físico sumiu → links quebrados.

---

## 2. Decisão de design

- **Bucket R2 com acesso público de leitura** (URL `r2.dev` ou domínio próprio).
  - Mantém o **mesmo nível de segurança de hoje**: o `/uploads` atual já é servido
    estaticamente **sem autenticação**, então qualquer um com o nome do arquivo já baixa.
  - O nome do objeto (key) continua aleatório/não-adivinhável.
- O **backend devolve a URL pronta** (`url`) em cada anexo/mensagem, em vez de o frontend
  montar `BACKEND/uploads/...`. Isso deixa o frontend "burro" e permite, no futuro, trocar
  para **URLs assinadas privadas sem mexer no frontend**.
- A coluna `filename` do banco é **reaproveitada** para guardar a *key* do objeto no R2
  (sem mudança de schema).

---

## 3. Passos manuais no Cloudflare (feitos pelo usuário)

1. Criar conta Cloudflare → **R2** → criar bucket (ex: `bahtech-uploads`).
2. Ativar **acesso público** no bucket (R2.dev subdomain) → gera URL base
   tipo `https://pub-xxxx.r2.dev`.
3. Criar um **API Token R2** → obter **Account ID**, **Access Key ID**, **Secret Access Key**.
4. Preencher as variáveis de ambiente (ver seção 5) no `.env` local e no Render.

---

## 4. Mudanças no código

### Backend
1. `npm install @aws-sdk/client-s3` (R2 é S3-compatível).
2. **Novo** `backend/src/services/storageService.js`: cliente S3 apontando para o R2 +
   funções `enviarArquivo(buffer, key, mimetype)`, `removerArquivo(key)`, `urlPublica(key)`.
3. `backend/src/routes/taskRoutes.js` e `chatRoutes.js`: multer `diskStorage` →
   **`memoryStorage`** (arquivo vira buffer, não vai para o disco).
4. `backend/src/controllers/attachmentController.js`: subir o buffer para o R2 antes de
   salvar; no delete, remover do R2. Remove `fs`/`path` local.
5. `backend/src/services/attachmentService.js`: guardar a *key* do R2 na coluna `filename`
   e devolver `url` em `salvarAnexo`/`listarAnexos`.
6. `backend/src/controllers/chatController.js` + `chat/chatService.js`: mesma lógica;
   incluir `url` no retorno e no `emit('receive_message')` do socket.
7. `backend/src/index.js`: remover `app.use('/uploads', express.static(...))`.

### Frontend
8. `frontend/src/types/index.ts`: adicionar `url?: string` em `Attachment` e `Message`.
9. `frontend/src/components/TaskCard.tsx` e `chat/MessageBubble.tsx`: trocar
   `${UPLOADS_BASE}/${filename}` por `att.url` / `message.url`; remover a constante
   `UPLOADS_BASE`.

### Config / Deploy
10. `backend/.env` (local) e `backend/.env.example`: adicionar as variáveis R2 (seção 5).
11. No **Render**: cadastrar as variáveis R2 no serviço backend.
12. Atualizar `CONTEXTO_PROJETO.md` (a seção 11 sobre "uploads se perdem" deixa de valer).

---

## 5. Variáveis de ambiente novas

```
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<access-key-id>
R2_SECRET_ACCESS_KEY=<secret-access-key>
R2_BUCKET=bahtech-uploads
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

---

## 6. O que NÃO muda

- Schema do banco (reaproveita a coluna `filename` para a key).
- Regras do projeto: CommonJS, sem ORM, credenciais só via `process.env`, `.env` não commitado.
- Limites e tipos de arquivo permitidos no multer (continuam iguais).

---

## 7. Arquivos antigos

Os arquivos atualmente em `/uploads` no Render provavelmente já se perderam em redeploys
anteriores. Não há o que migrar de forma confiável; daqui para frente todo upload novo vai
direto para o R2.
