const { pool } = require('../database');

const criarTarefa = async (title, description, userId) => {
  // Query para inserir a tarefa vinculada ao ID do usuário
  const query = `
    INSERT INTO tasks (title, description, "userId", completed)
    VALUES ($1, $2, $3, false)
    RETURNING id, title, description, completed, "userId", "createdAt";
  `;
  
  const resultado = await pool.query(query, [title, description, userId]);
  return resultado.rows[0];
};

module.exports = {
  criarTarefa
};