const { pool } = require('../database');
const bcrypt = require('bcryptjs');

// 1. Função de REGISTRO
const registarUtilizador = async (name, email, password) => {
  // Verificar se o e-mail já existe no banco
  const utilizadorExiste = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
  if (utilizadorExiste.rows.length > 0) {
    throw new Error('Este e-mail já está em uso.');
  }

  // Criptografar a palavra-passe
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Inserir o novo utilizador
  const query = `
    INSERT INTO users (name, email, "passwordHash") 
    VALUES ($1, $2, $3) 
    RETURNING id, name, email, "createdAt";
  `;
  
  const novoUtilizador = await pool.query(query, [name, email, passwordHash]);
  return novoUtilizador.rows[0];
};

// 2. Função de LOGIN
const autenticarUtilizador = async (email, password) => {
  // Procurar o utilizador pelo e-mail
  const resultado = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const utilizador = resultado.rows[0];

  // Se o utilizador não existir
  if (!utilizador) {
    throw new Error('E-mail ou palavra-passe incorretos.');
  }

  // Comparar a palavra-passe
  const passwordCorreta = await bcrypt.compare(password, utilizador.passwordHash);
  
  if (!passwordCorreta) {
    throw new Error('E-mail ou palavra-passe incorretos.');
  }

  return {
    id: utilizador.id,
    name: utilizador.name,
    email: utilizador.email
  };
};

// 3. Exportação de AMBAS as funções (Verifique se os nomes batem certinho aqui)
module.exports = {
  registrarUtilizador,
  autenticarUtilizador
};