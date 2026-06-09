const express = require('express');
const { conectarBanco } = require('./database');
const { criarTabelas } = require('./criarTabelas');
const authRoutes = require('./routes/authRoutes'); // 1. Importa as rotas de auth

const app = express();
const PORT = 3000;

app.use(express.json());

// 2. Vincula as rotas ao prefixo /api/auth
app.use('/api/auth', authRoutes);

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