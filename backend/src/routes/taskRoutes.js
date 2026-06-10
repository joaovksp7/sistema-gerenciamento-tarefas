const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const verificarToken = require('../middlewares/authMiddleware'); // O nosso segurança

// Rota protegida: O cliente acessa -> o guarda valida o token -> se estiver ok, o controlador cria a tarefa
router.post('/', verificarToken, taskController.create);

module.exports = router;