const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, addComment, getAssignedToMe, globalSearch } = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/assigned-to-me', protect, getAssignedToMe);
router.get('/search', protect, globalSearch);
router.post('/', protect, createTask);
router.get('/', protect, getTasks);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.post('/:id/comments', protect, addComment);

module.exports = router;
