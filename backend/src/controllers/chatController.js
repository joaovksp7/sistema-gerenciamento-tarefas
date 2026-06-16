const path = require('path');
const chatService = require('../chat/chatService');
const storageService = require('../services/storageService');

const gerarKey = (originalname) => {
  const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return 'chat/' + unique + path.extname(originalname);
};

const getConversations = async (req, res) => {
  try {
    const conversations = await chatService.listarConversasDoUsuario(req.userId);
    return res.status(200).json({ conversations });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createDirect = async (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) return res.status(400).json({ error: 'Usuário não informado.' });
  try {
    const convId = await chatService.criarConversaDireta(req.userId, targetUserId);
    req.io.to(`user:${req.userId}`).emit('new_conversation', { conversationId: convId });
    req.io.to(`user:${targetUserId}`).emit('new_conversation', { conversationId: convId });
    return res.status(200).json({ conversationId: convId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createGroup = async (req, res) => {
  const { name, memberIds } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome do grupo obrigatório.' });
  try {
    const convId = await chatService.criarGrupo(req.userId, name, memberIds || []);
    const allMembers = [req.userId, ...(memberIds || [])];
    allMembers.forEach((memberId) => {
      req.io.to(`user:${memberId}`).emit('new_conversation', { conversationId: convId });
    });
    return res.status(201).json({ conversationId: convId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await chatService.buscarMensagens(req.params.id, req.userId);
    return res.status(200).json({ messages });
  } catch (error) {
    const status = error.message === 'Acesso negado.' ? 403 : 500;
    return res.status(status).json({ error: error.message });
  }
};

const uploadMessage = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  const key = gerarKey(req.file.originalname);
  try {
    await storageService.enviarArquivo(req.file.buffer, key, req.file.mimetype);
    const type = req.body.type || (req.file.mimetype.startsWith('image/') ? 'image' : req.file.mimetype.startsWith('audio/') ? 'audio' : 'file');
    const message = await chatService.salvarMensagem(req.params.id, req.userId, {
      type,
      filename: key,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
    req.io.to(`conv:${req.params.id}`).emit('receive_message', message);
    return res.status(201).json({ message });
  } catch (error) {
    await storageService.removerArquivo(key).catch(() => {});
    return res.status(500).json({ error: error.message });
  }
};

const searchUsers = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query obrigatória.' });
  try {
    const users = await chatService.buscarUsuarioPorUsername(q.replace('@', ''));
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getConversations, createDirect, createGroup, getMessages, uploadMessage, searchUsers };
