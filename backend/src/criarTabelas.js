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
  `;

  try {
    await pool.query(queryTabelas);
    console.log('📊 Tabelas "users" e "tasks" verificadas/criadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao criar as tabelas no banco de dados:', err.message);
  }
};

module.exports = { criarTabelas };