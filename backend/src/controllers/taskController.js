const taskService = require('../services/taskService');

/**
 * Controlador encarregado de receber a requisição de criação de tarefa,
 * validar os dados vindos do cliente e acionar o serviço responsável.
 */
const create = async (req, res) => {
  // Extrai o título e a descrição enviados no corpo (body) da requisição
  const { title, description } = req.body;
  
  // O req.userId foi injetado pelo nosso authMiddleware após validar o Token JWT com sucesso!
  const userId = req.userId; 

  // Validação obrigatória: uma tarefa não pode existir sem um título
  if (!title) {
    return res.status(400).json({ error: 'O título da tarefa é obrigatório.' });
  }

  try {
    // Encaminha os dados lapidados para o operário (Service) salvar no banco
    const novaTarefa = await taskService.criarTarefa(title, description, userId);
    
    // Retorna a resposta de sucesso com o status 201 (Created)
    return res.status(201).json({
      message: 'Tarefa criada com sucesso!',
      task: novaTarefa
    });
  } catch (error) {
    // Caso ocorra alguma falha catastrófica no banco de dados, captura o erro aqui
    return res.status(500).json({ error: 'Erro interno ao criar tarefa.' });
  }
};

// Exporta o método de criação para ser utilizado no arquivo de rotas (taskRoutes.js)
module.exports = {
  create
};