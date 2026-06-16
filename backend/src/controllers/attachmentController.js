const path = require('path');
const attachmentService = require('../services/attachmentService');
const storageService = require('../services/storageService');

const gerarKey = (originalname) => {
  const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return 'tasks/' + unique + path.extname(originalname);
};

const uploadAnexo = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  const key = gerarKey(req.file.originalname);
  try {
    await storageService.enviarArquivo(req.file.buffer, key, req.file.mimetype);
    const anexo = await attachmentService.salvarAnexo(req.params.id, req.userId, req.file, key);
    return res.status(201).json({ attachment: anexo });
  } catch (error) {
    await storageService.removerArquivo(key).catch(() => {});
    const status = error.message === 'Tarefa não encontrada.' ? 404 : 500;
    return res.status(status).json({ error: error.message });
  }
};

const listarAnexos = async (req, res) => {
  try {
    const anexos = await attachmentService.listarAnexos(req.params.id, req.userId);
    return res.status(200).json({ attachments: anexos });
  } catch (error) {
    const status = error.message === 'Tarefa não encontrada.' ? 404 : 500;
    return res.status(status).json({ error: error.message });
  }
};

const removerAnexo = async (req, res) => {
  try {
    const anexo = await attachmentService.removerAnexo(req.params.attachmentId, req.params.id, req.userId);
    if (!anexo) return res.status(404).json({ error: 'Anexo não encontrado.' });
    await storageService.removerArquivo(anexo.filename).catch(() => {});
    return res.status(200).json({ message: 'Anexo removido com sucesso!' });
  } catch (error) {
    const status = error.message === 'Tarefa não encontrada.' ? 404 : 500;
    return res.status(status).json({ error: error.message });
  }
};

module.exports = { uploadAnexo, listarAnexos, removerAnexo };
