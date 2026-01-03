const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a project name'],
        trim: true
    },
    key: {
        type: String,
        required: [true, 'Please add a project key (e.g. PROJ)'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: 2,
        maxlength: 10
    },
    description: String,
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    defaultAssignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    icon: String, // URL or distinct color
    projectType: {
        type: String,
        enum: ['scrum', 'kanban', 'business'],
        default: 'scrum'
    },
    nextIssueNumber: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
