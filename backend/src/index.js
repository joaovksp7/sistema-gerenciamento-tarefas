require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const { conectarBanco } = require('./database');
const { criarTabelas } = require('./criarTabelas');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { setupSocket } = require('./chat/chatSocket');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const server = http.createServer(app);
const io = setupSocket(server);
app.use((req, res, next) => { req.io = io; next(); });

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Servidor do Projeto Piloto está online!');
});

const iniciarAplicacao = async () => {
  await conectarBanco();
  await criarTabelas();

  server.listen(PORT, () => {
    console.log(`✅ Servidor rodando com sucesso em http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  iniciarAplicacao();
}

module.exports = app;