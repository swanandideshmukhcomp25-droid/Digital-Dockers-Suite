const express = require('express');
const router = express.Router();
const { createSprint, getSprintsByProject, updateSprint, startSprint, completeSprint, getBurndown } = require('../controllers/sprintController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(protect, createSprint);
router.route('/project/:projectId').get(protect, getSprintsByProject);
router.route('/:id').put(protect, updateSprint);
router.route('/:id/burndown').get(protect, getBurndown);
router.post('/:id/start', protect, startSprint);
router.post('/:id/complete', protect, completeSprint);

module.exports = router;
