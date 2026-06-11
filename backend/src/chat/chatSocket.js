const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const chatService = require('./chatService');

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Autenticação necessária.'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Token inválido.'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;

    socket.join(`user:${userId}`);

    try {
      const conversations = await chatService.listarConversasDoUsuario(userId);
      conversations.forEach((conv) => socket.join(`conv:${conv.id}`));
    } catch {
      // silent
    }

    socket.on('send_message', async ({ conversationId, content }) => {
      try {
        const message = await chatService.salvarMensagem(conversationId, userId, {
          content,
          type: 'text',
        });
        io.to(`conv:${conversationId}`).emit('receive_message', message);
      } catch (err) {
        socket.emit('chat_error', { message: err.message });
      }
    });

    socket.on('typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', { conversationId, userId });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_stop_typing', { conversationId, userId });
    });

    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(`conv:${conversationId}`);
    });
  });

  return io;
};

module.exports = { setupSocket };
