const path = require('path');
const fs = require('fs');
const attachmentService = require('../services/attachmentService');

const uploadAnexo = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  try {
    const anexo = await attachmentService.salvarAnexo(req.params.id, req.userId, req.file);
    return res.status(201).json({ attachment: anexo });
  } catch (error) {
    const filePath = path.join(__dirname, '../../uploads', req.file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
    const filePath = path.join(__dirname, '../../uploads', anexo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(200).json({ message: 'Anexo removido com sucesso!' });
  } catch (error) {
    const status = error.message === 'Tarefa não encontrada.' ? 404 : 500;
    return res.status(status).json({ error: error.message });
  }
};

module.exports = { uploadAnexo, listarAnexos, removerAnexo };
