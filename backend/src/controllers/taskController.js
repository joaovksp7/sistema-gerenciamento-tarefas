const taskService = require('../services/taskService');

const create = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.userId;

  if (!title) {
    return res.status(400).json({ error: 'O título da tarefa é obrigatório.' });
  }

  try {
    const novaTarefa = await taskService.criarTarefa(title, description, userId);
    return res.status(201).json({ message: 'Tarefa criada com sucesso!', task: novaTarefa });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao criar tarefa.' });
  }
};

const list = async (req, res) => {
  const userId = req.userId;

  try {
    const tarefas = await taskService.listarTarefas(userId);
    return res.status(200).json({ tasks: tarefas });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao listar tarefas.' });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { title, description, dueDate } = req.body;

  if (!title && !description && !dueDate) {
    return res.status(400).json({ error: 'Informe ao menos um campo para atualizar.' });
  }

  try {
    const tarefa = await taskService.atualizarTarefa(id, userId, { title, description, dueDate });

    if (!tarefa) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    return res.status(200).json({ message: 'Tarefa atualizada com sucesso!', task: tarefa });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao atualizar tarefa.' });
  }
};

const complete = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const tarefa = await taskService.concluirTarefa(id, userId);

    if (!tarefa) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    return res.status(200).json({ message: 'Tarefa marcada como concluída!', task: tarefa });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao concluir tarefa.' });
  }
};

const remove = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const tarefa = await taskService.deletarTarefa(id, userId);

    if (!tarefa) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    return res.status(200).json({ message: 'Tarefa deletada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao deletar tarefa.' });
  }
};

module.exports = { create, list, update, complete, remove };
