const express = require('express');
const router = express.Router();
const { getChatHistory, saveMessage } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/history/:room', protect, getChatHistory);
router.post('/', protect, saveMessage);

module.exports = router;
