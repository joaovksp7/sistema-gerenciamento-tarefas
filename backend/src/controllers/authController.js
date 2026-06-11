const userService = require('../services/userService');
const jwt = require('jsonwebtoken'); // Importa o gerador de token

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { name, email, password, username } = req.body;
  if (!name || !email || !password || !username)
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username))
    return res.status(400).json({ error: 'Nome de usuário inválido. Use letras, números e _ (3-20 caracteres).' });

  try {
    const utilizador = await userService.registarUtilizador(name, email, password, username);
    const token = jwt.sign({ id: utilizador.id }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(201).json({ message: 'Utilizador registado com sucesso!', user: utilizador, token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// NOVA FUNÇÃO: Login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor, preencha o e-mail e a palavra-passe.' });
  }

  try {
    // Valida o e-mail e a senha no banco
    const utilizador = await userService.autenticarUtilizador(email, password);

    // Cria o Token JWT incluindo o ID do utilizador lá dentro. Ele expira em 1 dia (24h)
    const token = jwt.sign({ id: utilizador.id }, JWT_SECRET, { expiresIn: '24h' });

    // Retorna os dados do utilizador e o Token de acesso
    return res.status(200).json({
      message: 'Login efetuado com sucesso!',
      user: utilizador,
      token: token
    });
  } catch (error) {
    return res.status(401).json({ error: error.message }); // 401 = Unauthorized
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Preencha todos os campos.' });

  if (newPassword.length < 6)
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });

  try {
    await userService.alterarSenha(req.userId, currentPassword, newPassword);
    return res.status(200).json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  changePassword,
};