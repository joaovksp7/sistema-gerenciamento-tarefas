const { pool } = require('../database');

const verificarPropriedadeTarefa = async (taskId, userId) => {
  const resultado = await pool.query(
    'SELECT id FROM tasks WHERE id = $1 AND "userId" = $2',
    [taskId, userId]
  );
  if (!resultado.rows[0]) throw new Error('Tarefa não encontrada.');
};

const salvarAnexo = async (taskId, userId, file) => {
  await verificarPropriedadeTarefa(taskId, userId);
  const query = `
    INSERT INTO task_attachments ("taskId", filename, "originalName", mimetype, size)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, "taskId", filename, "originalName", mimetype, size, "createdAt";
  `;
  const resultado = await pool.query(query, [
    taskId, file.filename, file.originalname, file.mimetype, file.size,
  ]);
  return resultado.rows[0];
};

const listarAnexos = async (taskId, userId) => {
  await verificarPropriedadeTarefa(taskId, userId);
  const query = `
    SELECT id, "taskId", filename, "originalName", mimetype, size, "createdAt"
    FROM task_attachments
    WHERE "taskId" = $1
    ORDER BY "createdAt" ASC;
  `;
  const resultado = await pool.query(query, [taskId]);
  return resultado.rows;
};

const removerAnexo = async (attachmentId, taskId, userId) => {
  await verificarPropriedadeTarefa(taskId, userId);
  const resultado = await pool.query(
    'DELETE FROM task_attachments WHERE id = $1 AND "taskId" = $2 RETURNING filename',
    [attachmentId, taskId]
  );
  return resultado.rows[0];
};

module.exports = { salvarAnexo, listarAnexos, removerAnexo };
