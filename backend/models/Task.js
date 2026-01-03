const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    // Jira: Issue Key (e.g. PROJ-123). Will be auto-generated in controller.
    key: {
        type: String,
        unique: true,
        sparse: true
    },
    title: {
        type: String,
        required: [true, 'Please add a task title']
    },
    description: String, // Rich text content
    issueType: {
        type: String,
        enum: ['story', 'task', 'bug', 'epic', 'subtask'],
        default: 'task'
    },
    priority: {
        type: String,
        enum: ['lowest', 'low', 'medium', 'high', 'highest'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'review', 'done', 'blocked'], // Keeping some old ones but effectively mapping to Jira columns
        default: 'todo'
    },
    storyPoints: Number,

    // Relations
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    sprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sprint'
    },
    epic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Epic'
    },
    parentTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task' // For subtasks
    },

    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Dates
    dueDate: Date,
    startDate: Date,

    estimatedTime: Number, // in hours

    // Original Fields (Keeping for compatibility or AI features)
    aiSuggestions: {
        timeBreakdown: [{
            phase: String,
            duration: Number,
            description: String
        }],
        dependencies: [String],
        recommendedAssignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        complexity: String
    },
    linkedMeeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting'
    },
    // We can deprecate linkedProject in favor of 'project' but keeping for safety if used elsewhere
    linkedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },

    tags: [String],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    attachments: [String], // URLs
    labels: [String], // Jira-style labels
    history: [{
        field: String,
        oldValue: String,
        newValue: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    completedAt: Date, // For velocity calculation
    completedPoints: Number, // Snapshot of points when completed
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
