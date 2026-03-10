// Track online users: Map<userId, socketId>
const userSocketMap = new Map();

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap.get(receiverId);
};

const socketSetup = (io) => {
    io.on("connection", (socket) => {
        console.log(`[Socket] A user connected: ${socket.id}`);

        const userId = socket.handshake.query.userId;
        
        if (userId && userId !== "undefined") {
            userSocketMap.set(userId, socket.id);
            console.log(`[Socket] User mapped: ${userId} -> ${socket.id}`);
        }

        // Broadcast online users to everyone
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

        socket.on("disconnect", () => {
             console.log(`[Socket] A user disconnected: ${socket.id}`);
             if (userId) {
                 userSocketMap.delete(userId);
                 io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
             }
        });
    });
};

export default socketSetup;