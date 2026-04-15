const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const protect = require('../middleware/authMiddleware');

// @route   GET /api/messages/:roomId
// @desc    Get chat history for a specific room
// @access  Private
router.get('/:roomId', protect, async (req, res) => {
    try {
        const { roomId } = req.params;

        // Validation: If no roomId, return empty array rather than crashing
        if (!roomId || roomId === 'undefined') {
            return res.json([]);
        }

        // Search for messages matching the roomId OR groupId
        const messages = await Message.find({
            $or: [
                { roomId: roomId }, 
                { groupId: roomId }
            ]
        })
        .populate('sender', 'username') // Joins User data to get names
        .sort({ createdAt: 1 })        // Oldest first for chat flow
        .lean();                       // Optimized for read-only speed

        console.log(`📡 History fetched for room: ${roomId} (${messages.length} messages)`);
        
        res.json(messages);
    } catch (err) {
        console.error("❌ Error fetching messages:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;