const express = require('express');
const router = express.Router();
const multer = require('multer');
const verificarToken = require('../middlewares/authMiddleware');
const chatController = require('../controllers/chatController');

const storage = multer.memoryStorage();

const allowedMimes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain',
  'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg',
];

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de arquivo não permitido.'));
  },
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

router.get('/conversations', verificarToken, chatController.getConversations);
router.post('/conversations/direct', verificarToken, chatController.createDirect);
router.post('/conversations/group', verificarToken, chatController.createGroup);
router.get('/conversations/:id/messages', verificarToken, chatController.getMessages);
router.post('/conversations/:id/messages/upload', verificarToken, handleUpload, chatController.uploadMessage);
router.get('/users/search', verificarToken, chatController.searchUsers);

module.exports = router;
