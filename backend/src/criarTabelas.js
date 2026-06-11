const { pool } = require('./database');

const criarTabelas = async () => {
  // Código SQL baseado exatamente na especificação do projeto
  const queryTabelas = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      "passwordHash" VARCHAR(255) NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT false,
      "dueDate" DATE,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS task_attachments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "taskId" UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      filename VARCHAR(255) NOT NULL,
      "originalName" VARCHAR(255) NOT NULL,
      mimetype VARCHAR(100) NOT NULL,
      size INTEGER NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'username'
      ) THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS chat_conversations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      type VARCHAR(10) NOT NULL CHECK (type IN ('direct', 'group')),
      name VARCHAR(100),
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_conversation_members (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "conversationId" UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
      "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "joinedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE ("conversationId", "userId")
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "conversationId" UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
      "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "senderName" VARCHAR(255) NOT NULL,
      type VARCHAR(10) NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'audio')),
      content TEXT,
      filename VARCHAR(255),
      "originalName" VARCHAR(255),
      mimetype VARCHAR(100),
      size INTEGER,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(queryTabelas);
    console.log('📊 Tabelas verificadas/criadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar as tabelas no banco de dados:', err.message);
  }
};

module.exports = { criarTabelas };