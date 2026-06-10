const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
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