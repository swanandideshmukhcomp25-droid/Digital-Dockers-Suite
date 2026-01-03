const mongoose = require('mongoose');

const sprintSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a sprint name']
    },
    goal: String,
    startDate: Date,
    endDate: Date,
    status: {
        type: String,
        enum: ['future', 'active', 'closed'],
        default: 'future'
    },
    // Metrics
    committedPoints: { type: Number, default: 0 },
    completedPoints: { type: Number, default: 0 },
    velocity: { type: Number, default: 0 },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    // Useful for reordering in the backlog list if needed, but usually calculated
    boardIndex: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('Sprint', sprintSchema);
