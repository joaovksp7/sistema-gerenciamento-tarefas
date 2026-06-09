const jwt = require('jsonwebtoken');

// A mesma chave secreta que usamos para gerar o token no controlador
const JWT_SECRET = 'minha_chave_secreta_super_segura';

const verificarToken = (req, res, next) => {
  // 1. Pegar o token que vem no cabeçalho (Header) da requisição
  const authHeader = req.headers['authorization'];

  // O token geralmente vem no formato: "Bearer TEXTO_DO_TOKEN"
  // Vamos dividir o texto para pegar só a parte do código
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Se não enviar nenhum token, barra na entrada!
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // 3. Tenta decifrar o token com a nossa chave secreta
    const verificado = jwt.verify(token, JWT_SECRET);
    
    // Se o token for válido, salvamos o ID do usuário dentro da requisição (req.user)
    // para que as próximas rotas saibam quem está logado
    req.userId = verificado.id;

    // Autoriza a requisição a seguir em frente para a rota desejada
    next();
  } catch (error) {
    // Se o token estiver vencido ou for falso, joga um erro
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = verificarToken;