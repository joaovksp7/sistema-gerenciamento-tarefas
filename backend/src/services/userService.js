const { pool } = require('../database');
const bcrypt = require('bcryptjs');

// 1. REGISTRO
const registarUtilizador = async (name, email, password) => {
  const utilizadorExiste = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
  if (utilizadorExiste.rows.length > 0) {
    throw new Error('Este e-mail já está em uso.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const query = `
    INSERT INTO users (name, email, "passwordHash") 
    VALUES ($1, $2, $3) 
    RETURNING id, name, email, "createdAt";
  `;
  
  const novoUtilizador = await pool.query(query, [name, email, passwordHash]);
  return novoUtilizador.rows[0];
};

// 2. LOGIN
const autenticarUtilizador = async (email, password) => {
  const resultado = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const utilizador = resultado.rows[0];

  if (!utilizador) {
    throw new Error('E-mail ou palavra-passe incorretos.');
  }

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

// 3. EXPORTAÇÃO (Repare: sem nenhum "r" depois do "git")
module.exports = {
  registarUtilizador,
  autenticarUtilizador
};