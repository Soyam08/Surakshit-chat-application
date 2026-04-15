const Message = require('../models/Message');

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('⚡ User connected:', socket.id);

        // Join a unique chat room (Private or Group)
        socket.on('join_chat', (roomId) => {
            if (!roomId) return;
            
            // Leave previous rooms to avoid "ghost" messages
            const currentRooms = Array.from(socket.rooms);
            currentRooms.forEach((room) => {
                if (room !== socket.id) socket.leave(room);
            });

            socket.join(roomId);
            console.log(`👤 User joined room: ${roomId}`);
        });

        // Handle sending messages
        socket.on('send_message', async (data) => {
            try {
                const { sender, content, chatType, receiver, groupId, roomId } = data;

                // Validation
                if (!content || !roomId) {
                    console.log("⚠️ Blocked empty message or missing roomId");
                    return;
                }

                // 1. Save message to MongoDB Atlas
                const newMessage = new Message({ 
                    sender, 
                    content, 
                    chatType, 
                    receiver, 
                    groupId,
                    roomId 
                });

                await newMessage.save();
                
                // 2. Populate sender info (username)
                const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username');
                
                // 3. LOGGING: Very important for debugging your current issue
                console.log(`✉️ Msg from ${populatedMessage.sender.username} to Room: ${roomId}`);

                // 4. Emit to everyone in the room
                // We use io.to(roomId) to ensure it reaches everyone, including the sender
                io.to(roomId).emit('new_message', populatedMessage);
                
            } catch (err) {
                console.error("❌ Socket Error (send_message):", err.message);
                socket.emit('error_message', { message: "Message could not be sent" });
            }
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
            if (data.roomId) {
                socket.to(data.roomId).emit('user_typing', { 
                    user: data.user,
                    roomId: data.roomId 
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('🔌 User disconnected');
        });
    });
};

module.exports = socketHandler;