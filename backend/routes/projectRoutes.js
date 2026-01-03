const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, getProjectStats } = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(protect, createProject).get(protect, getProjects);
router.route('/:id').get(protect, getProjectById);
router.route('/:id/stats').get(protect, getProjectStats);

module.exports = router;
