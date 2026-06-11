const { pool } = require('../database');
const bcrypt = require('bcryptjs');

// 1. REGISTRO
const registarUtilizador = async (name, email, password, username) => {
  const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (emailCheck.rows.length > 0) throw new Error('Este e-mail já está em uso.');

  const usernameCheck = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  if (usernameCheck.rows.length > 0) throw new Error('Este nome de usuário já está em uso.');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const query = `
    INSERT INTO users (name, email, "passwordHash", username)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, username, "createdAt";
  `;

  const novoUtilizador = await pool.query(query, [name, email, passwordHash, username.toLowerCase()]);
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
    email: utilizador.email,
    username: utilizador.username,
  };
};

// 3. ALTERAR SENHA
const alterarSenha = async (userId, currentPassword, newPassword) => {
  const resultado = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  const utilizador = resultado.rows[0];

  if (!utilizador) throw new Error('Utilizador não encontrado.');

  const senhaCorreta = await bcrypt.compare(currentPassword, utilizador.passwordHash);
  if (!senhaCorreta) throw new Error('Senha atual incorreta.');

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);

  await pool.query('UPDATE users SET "passwordHash" = $1 WHERE id = $2', [newHash, userId]);
};

module.exports = {
  registarUtilizador,
  autenticarUtilizador,
  alterarSenha,
};