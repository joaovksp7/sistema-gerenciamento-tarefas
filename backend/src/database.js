const { Pool } = require('pg');

// Configura os dados de acesso ao banco de dados (iguais aos do docker-compose)
const pool = new Pool({
  user: 'meu_usuario',
  host: 'localhost',
  database: 'gerenciador_tarefas',
  password: 'minha_senha_secreta',
  port: 5432, // Porta padrão do PostgreSQL
});

// Função auxiliar para testar a conexão
const conectarBanco = async () => {
  try {
    const client = await pool.connect();
    console.log('🐘 Conectado ao banco de dados PostgreSQL com sucesso!');
    client.release(); // Libera o cliente de volta para o pool
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
  }
};

module.exports = {
  pool,
  conectarBanco
};