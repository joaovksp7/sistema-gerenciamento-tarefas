const { pool } = require('../database');

const criarTarefa = async (title, description, userId) => {
  const query = `
    INSERT INTO tasks (title, description, "userId", completed)
    VALUES ($1, $2, $3, false)
    RETURNING id, title, description, completed, "dueDate", "userId", "createdAt";
  `;
  const resultado = await pool.query(query, [title, description, userId]);
  return resultado.rows[0];
};

const listarTarefas = async (userId) => {
  const query = `
    SELECT id, title, description, completed, "dueDate", "createdAt", "updatedAt"
    FROM tasks
    WHERE "userId" = $1
    ORDER BY "createdAt" DESC;
  `;
  const resultado = await pool.query(query, [userId]);
  return resultado.rows;
};

const atualizarTarefa = async (id, userId, { title, description, dueDate }) => {
  const query = `
    UPDATE tasks
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      "dueDate" = COALESCE($3, "dueDate"),
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = $4 AND "userId" = $5
    RETURNING id, title, description, completed, "dueDate", "updatedAt";
  `;
  const resultado = await pool.query(query, [title, description, dueDate, id, userId]);
  return resultado.rows[0];
};

const concluirTarefa = async (id, userId) => {
  const query = `
    UPDATE tasks
    SET completed = true, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = $1 AND "userId" = $2
    RETURNING id, title, completed, "updatedAt";
  `;
  const resultado = await pool.query(query, [id, userId]);
  return resultado.rows[0];
};

const deletarTarefa = async (id, userId) => {
  const query = `
    DELETE FROM tasks
    WHERE id = $1 AND "userId" = $2
    RETURNING id;
  `;
  const resultado = await pool.query(query, [id, userId]);
  return resultado.rows[0];
};

module.exports = {
  criarTarefa,
  listarTarefas,
  atualizarTarefa,
  concluirTarefa,
  deletarTarefa,
};
