const asyncHandler = require('express-async-handler');
const Epic = require('../models/Epic');

// @desc    Create an epic
// @route   POST /api/epics
// @access  Private
const createEpic = asyncHandler(async (req, res) => {
    const { name, summary, color, projectId, startDate, dueDate } = req.body;

    const epic = await Epic.create({
        name,
        summary,
        color,
        project: projectId,
        startDate,
        dueDate
    });

    res.status(201).json(epic);
});

// @desc    Get epics for a project
// @route   GET /api/epics/project/:projectId
// @access  Private
const getEpicsByProject = asyncHandler(async (req, res) => {
    const epics = await Epic.find({ project: req.params.projectId });
    res.json(epics);
});

module.exports = {
    createEpic,
    getEpicsByProject
};
