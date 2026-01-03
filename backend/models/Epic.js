const mongoose = require('mongoose');

const epicSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: '#8777D9' // Default purple-ish epic color
    },
    status: {
        type: String,
        enum: ['to_do', 'in_progress', 'done'],
        default: 'to_do'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    startDate: Date, // For roadmap
    dueDate: Date // For roadmap
}, {
    timestamps: true
});

module.exports = mongoose.model('Epic', epicSchema);
