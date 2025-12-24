const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const User = require('../models/User');
const { analyzeTask } = require('../services/openaiService');
const { createTaskCalendarEvent, updateTaskCalendarEvent, deleteTaskCalendarEvent, refreshAccessToken } = require('../services/googleCalendarService');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Leaders/Admins only)
const createTask = asyncHandler(async (req, res) => {
    const { title, description, deadline, assignedTo, priority } = req.body;

    // Authorization - only leaders and admins can create tasks
    const authorizedRoles = ['admin', 'project_manager', 'technical_lead', 'marketing_lead'];
    if (!authorizedRoles.includes(req.user.role)) {
        res.status(403);
        throw new Error('Not authorized to create tasks');
    }

    if (!title) {
        res.status(400);
        throw new Error('Please add a task title');
    }

    // AI Analysis
    const aiAnalysis = await analyzeTask(description, deadline);

    const task = await Task.create({
        title,
        description,
        priority: priority || aiAnalysis.priority || 'medium',
        status: 'todo',
        assignedTo: assignedTo || [req.user._id],
        assignedBy: req.user._id,
        dueDate: deadline,
        aiSuggestions: {
            timeBreakdown: aiAnalysis.timeBreakdown,
            dependencies: aiAnalysis.dependencies
        }
    });

    // Google Calendar Integration - Create calendar events for assigned users
    if (task.dueDate && task.assignedTo && task.assignedTo.length > 0) {
        for (const userId of task.assignedTo) {
            try {
                const user = await User.findById(userId);

                if (user && user.googleAccessToken) {
                    let accessToken = user.googleAccessToken;

                    // Check if token needs refresh
                    if (user.googleRefreshToken && user.googleTokenExpiry) {
                        const now = new Date();
                        const tokenExpiry = new Date(user.googleTokenExpiry);

                        if (tokenExpiry <= new Date(now.getTime() + 5 * 60 * 1000)) {
                            try {
                                const refreshed = await refreshAccessToken(user.googleRefreshToken);
                                accessToken = refreshed.access_token;
                                user.googleAccessToken = refreshed.access_token;
                                user.googleTokenExpiry = new Date(Date.now() + refreshed.expires_in * 1000);
                                await user.save();
                            } catch (error) {
                                console.error(`Token refresh failed for user ${userId}:`, error.message);
                                continue;
                            }
                        }
                    }

                    // Create calendar event
                    const eventId = await createTaskCalendarEvent(accessToken, {
                        title: task.title,
                        description: task.description,
                        dueDate: task.dueDate
                    });

                    // Store event ID in task (we'll store first successfully created event)
                    if (!task.calendarEventId) {
                        task.calendarEventId = eventId;
                        await task.save();
                    }

                    console.log(`✅ Calendar event created for user ${user.fullName}`);
                }
            } catch (error) {
                console.error(`Failed to create calendar event for user ${userId}:`, error.message);
                // Continue even if calendar sync fails for one user
            }
        }
    }

    await task.populate('assignedTo', 'fullName email');
    await task.populate('assignedBy', 'fullName email');

    res.status(201).json(task);
});

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    let query = {
        $or: [{ assignedTo: req.user._id }, { assignedBy: req.user._id }]
    };

    // Allow Admin and Leaders to see all tasks
    const fullAccessRoles = ['admin', 'Project Manager', 'Technical Lead'];
    if (fullAccessRoles.includes(req.user.role)) {
        query = {}; // No filter, return all
    }

    const tasks = await Task.find(query)
        .populate('assignedTo', 'fullName email')
        .populate('assignedBy', 'fullName')
        .sort('-createdAt');

    res.status(200).json(tasks);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Check authorization - creator, assignees, or admin can update
    const isCreator = task.assignedBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo.some(id => id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAssignee && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to update this task');
    }

    // Update task fields
    const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate('assignedTo', 'fullName email')
        .populate('assignedBy', 'fullName email');

    // Google Calendar Integration - Update calendar event if dueDate changed
    if (req.body.dueDate && task.dueDate && task.calendarEventId) {
        const oldDate = new Date(task.dueDate).getTime();
        const newDate = new Date(req.body.dueDate).getTime();

        if (oldDate !== newDate) {
            // Try to update calendar event for each assigned user
            for (const userId of updatedTask.assignedTo) {
                try {
                    const user = await User.findById(userId._id || userId);

                    if (user && user.googleAccessToken) {
                        await updateTaskCalendarEvent(user.googleAccessToken, task.calendarEventId, {
                            title: updatedTask.title,
                            description: updatedTask.description,
                            dueDate: updatedTask.dueDate
                        });
                        console.log(`✅ Calendar event updated for user ${user.fullName}`);
                    }
                } catch (error) {
                    console.error(`Failed to update calendar event:`, error.message);
                }
            }
        }
    }

    // If task status changed to completed, optionally delete calendar event
    if (req.body.status === 'completed' && task.calendarEventId) {
        for (const userId of updatedTask.assignedTo) {
            try {
                const user = await User.findById(userId._id || userId);

                if (user && user.googleAccessToken) {
                    await deleteTaskCalendarEvent(user.googleAccessToken, task.calendarEventId);
                    console.log(`✅ Calendar event deleted for completed task`);
                }
            } catch (error) {
                console.error(`Failed to delete calendar event:`, error.message);
            }
        }
    }

    res.status(200).json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Creator or Admin only)
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Only creator or admin can delete
    const isCreator = task.assignedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
        res.status(403);
        throw new Error('Not authorized to delete this task');
    }

    // Google Calendar Integration -Delete calendar event if exists
    if (task.calendarEventId && task.assignedTo) {
        for (const userId of task.assignedTo) {
            try {
                const user = await User.findById(userId);

                if (user && user.googleAccessToken) {
                    await deleteTaskCalendarEvent(user.googleAccessToken, task.calendarEventId);
                    console.log(`✅ Calendar event deleted for user ${user.fullName}`);
                }
            } catch (error) {
                console.error(`Failed to delete calendar event:`, error.message);
            }
        }
    }

    await task.deleteOne();

    res.status(200).json({ message: 'Task deleted successfully', id: req.params.id });
});

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};
