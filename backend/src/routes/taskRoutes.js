const express = require('express');
const router = express.Router();
const multer = require('multer');
const taskController = require('../controllers/taskController');
const attachmentController = require('../controllers/attachmentController');
const verificarToken = require('../middlewares/authMiddleware');

const storage = multer.memoryStorage();

const allowedMimes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain',
];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de arquivo não permitido.'));
  },
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Erro ao fazer upload.' });
    next();
  });
};

router.get('/', verificarToken, taskController.list);
router.post('/', verificarToken, taskController.create);
router.patch('/:id/complete', verificarToken, taskController.complete);
router.patch('/:id', verificarToken, taskController.update);
router.delete('/:id', verificarToken, taskController.remove);

router.post('/:id/attachments', verificarToken, handleUpload, attachmentController.uploadAnexo);
router.get('/:id/attachments', verificarToken, attachmentController.listarAnexos);
router.delete('/:id/attachments/:attachmentId', verificarToken, attachmentController.removerAnexo);

module.exports = router;
