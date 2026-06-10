require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { conectarBanco } = require('./database');
const { criarTabelas } = require('./criarTabelas');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const iniciarAplicacao = async () => {
  await conectarBanco();
  await criarTabelas();
  
  app.listen(PORT, () => {
    console.log(`✅ Servidor rodando com sucesso em http://localhost:${PORT}`);
  });
};

iniciarAplicacao();

app.get('/', (req, res) => {
    res.send('🚀 Servidor do Projeto Piloto está online!');
});