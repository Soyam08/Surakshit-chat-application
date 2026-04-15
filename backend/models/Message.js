const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    chatType: { type: String, enum: ['private', 'group'], required: true },
    roomId: { type: String, required: true }, // The "address" of the chat
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);