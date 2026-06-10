const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/', verificarToken, taskController.list);
router.post('/', verificarToken, taskController.create);
router.patch('/:id', verificarToken, taskController.update);
router.patch('/:id/complete', verificarToken, taskController.complete);
router.delete('/:id', verificarToken, taskController.remove);

module.exports = router;
