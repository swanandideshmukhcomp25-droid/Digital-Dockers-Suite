const express = require('express');
const router = express.Router();
const { sendMessage, getWelcome } = require('../controllers/chatbotController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

router.post('/message', sendMessage);
router.get('/welcome', getWelcome);

module.exports = router;
