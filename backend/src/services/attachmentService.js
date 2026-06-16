const { pool } = require('../database');
const storageService = require('./storageService');

const comUrl = (anexo) => ({ ...anexo, url: storageService.urlPublica(anexo.filename) });

const verificarPropriedadeTarefa = async (taskId, userId) => {
  const resultado = await pool.query(
    'SELECT id FROM tasks WHERE id = $1 AND "userId" = $2',
    [taskId, userId]
  );
  if (!resultado.rows[0]) throw new Error('Tarefa não encontrada.');
};

const salvarAnexo = async (taskId, userId, file, key) => {
  await verificarPropriedadeTarefa(taskId, userId);
  const query = `
    INSERT INTO task_attachments ("taskId", filename, "originalName", mimetype, size)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, "taskId", filename, "originalName", mimetype, size, "createdAt";
  `;
  const resultado = await pool.query(query, [
    taskId, key, file.originalname, file.mimetype, file.size,
  ]);
  return comUrl(resultado.rows[0]);
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
  return resultado.rows.map(comUrl);
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
