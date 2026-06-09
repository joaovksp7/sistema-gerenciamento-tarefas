const { pool } = require('../database');

const criarTarefa = async (title, description, userId) => {
  // Query para inserir a tarefa vinculada ao ID do usuário
  const query = `
    INSERT INTO tasks (title, description, "userId", status)
    VALUES ($1, $2, $3, 'pendente')
    RETURNING id, title, description, status, "userId", "createdAt";
  `;
  
  const resultado = await pool.query(query, [title, description, userId]);
  return resultado.rows[0];
};

module.exports = {
  criarTarefa
};