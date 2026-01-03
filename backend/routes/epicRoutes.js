const express = require('express');
const router = express.Router();
const { createEpic, getEpicsByProject } = require('../controllers/epicController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(protect, createEpic);
router.route('/project/:projectId').get(protect, getEpicsByProject);

module.exports = router;
