const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

// @desc    Get Chat History
// @route   GET /api/chat/history/:room
// @access  Private
const getChatHistory = asyncHandler(async (req, res) => {
    const { room } = req.params;

    const messages = await Message.find({ room }).populate('sender', 'fullName email').sort({ createdAt: 1 });
    res.status(200).json(messages);
});

// @desc    Save Chat Message
// @route   POST /api/chat
// @access  Private
const saveMessage = asyncHandler(async (req, res) => {
    const { message, room, recipient } = req.body;

    if (!message || !message.trim()) {
        res.status(400);
        throw new Error('Message is required');
    }

    const newMessage = await Message.create({
        message: message.trim(),
        room: room || 'general',
        recipient: recipient || null,
        sender: req.user._id
    });

    await newMessage.populate('sender', 'fullName email');

    res.status(201).json(newMessage);
});

module.exports = {
    getChatHistory,
    saveMessage
};
