const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middlewares/authMiddleware');

// @route   GET /api/activity
// @desc    Get activity logs (paginated)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { projectId, limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = projectId ? { project: projectId } : {};

        const activities = await ActivityLog.find(query)
            .populate('actor', 'fullName email')
            .populate('project', 'name key')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ActivityLog.countDocuments(query);

        res.json({
            activities,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/activity/project/:projectId
// @desc    Get activity for a specific project
// @access  Private
router.get('/project/:projectId', protect, async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const activities = await ActivityLog.find({ project: req.params.projectId })
            .populate('actor', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(activities);
    } catch (error) {
        console.error('Error fetching project activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/activity/mark-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-read', protect, async (req, res) => {
    try {
        await ActivityLog.updateMany(
            { isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/activity/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await ActivityLog.countDocuments({ isRead: false });
        res.json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
