const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
    const { name, key, type, description } = req.body;

    const projectExists = await Project.findOne({ key });
    if (projectExists) {
        res.status(400);
        throw new Error('Project key already exists');
    }

    const project = await Project.create({
        name,
        key,
        description,
        type,
        lead: req.user._id,
        members: [req.user._id] // Creator is a member by default
    });

    res.status(201).json(project);
});

// @desc    Get all projects (that user is a member of)
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
    // For now, return all projects or filter by membership
    // const projects = await Project.find({ members: req.user._id }); 
    const projects = await Project.find({}); // MVP: See all projects
    res.json(projects);
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('lead', 'name email avatar')
        .populate('members', 'name email avatar');

    if (project) {
        res.json(project);
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});

// @desc    Get project statistics for dashboard
// @route   GET /api/projects/:id/stats
// @access  Private
const Task = require('../models/Task');
const Sprint = require('../models/Sprint');

const getProjectStats = asyncHandler(async (req, res) => {
    const projectId = req.params.id;

    // Get active sprint
    const activeSprint = await Sprint.findOne({
        project: projectId,
        status: 'active'
    });

    // Get all tasks for this project
    const tasks = await Task.find({ project: projectId });
    const sprintTasks = activeSprint
        ? tasks.filter(t => t.sprint && t.sprint.toString() === activeSprint._id.toString())
        : [];

    // Calculate metrics
    const totalSprintPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const doneSprintPoints = sprintTasks
        .filter(t => t.status === 'done')
        .reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    const issuesDone = sprintTasks.filter(t => t.status === 'done').length;

    // Days remaining in sprint
    let daysRemaining = 0;
    if (activeSprint && activeSprint.endDate) {
        const today = new Date();
        const endDate = new Date(activeSprint.endDate);
        daysRemaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    }

    // Velocity from closed sprints
    const closedSprints = await Sprint.find({
        project: projectId,
        status: 'closed'
    }).sort({ endDate: -1 }).limit(5);

    const velocity = closedSprints.length > 0
        ? Math.round(closedSprints.reduce((acc, s) => acc + (s.completedPoints || 0), 0) / closedSprints.length)
        : 0;

    // Issue status breakdown
    const statusBreakdown = {
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length
    };

    // Workload by assignee
    const workload = [];
    const assigneeMap = new Map();
    tasks.filter(t => t.status !== 'done').forEach(task => {
        task.assignedTo.forEach(userId => {
            const id = userId.toString();
            assigneeMap.set(id, (assigneeMap.get(id) || 0) + (task.storyPoints || 1));
        });
    });

    // Populate workload with user info
    for (const [userId, points] of assigneeMap) {
        const user = await User.findById(userId).select('fullName');
        if (user) {
            workload.push({ userId, name: user.fullName, points });
        }
    }

    res.json({
        sprintProgress: totalSprintPoints > 0 ? Math.round((doneSprintPoints / totalSprintPoints) * 100) : 0,
        issuesDone,
        daysRemaining,
        velocity,
        statusBreakdown,
        workload,
        activeSprint: activeSprint ? {
            _id: activeSprint._id,
            name: activeSprint.name,
            endDate: activeSprint.endDate
        } : null
    });
});

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    getProjectStats
};
