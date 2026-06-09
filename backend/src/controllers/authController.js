const userService = require('../services/userService');
const jwt = require('jsonwebtoken'); // Importa o gerador de token

// Uma chave secreta para assinar o token (em produção isso fica escondido, mas vamos fixar para aprender)
const JWT_SECRET = 'minha_chave_secreta_super_segura';

const register = async (req, res) => {
  // ... o código do register que fizemos antes continua exatamente igual aqui ...
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  try {
    const utilizador = await userService.registarUtilizador(name, email, password);
    return res.status(201).json({ message: 'Utilizador registado com sucesso!', user: utilizador });
  } catch (error) { return res.status(400).json({ error: error.message }); }
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

module.exports = {
  register,
  login // Não esqueça de exportar o login
};