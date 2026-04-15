const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    groupName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    admin: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);