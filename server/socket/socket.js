import User from "../models/User.js";
import logger from "../utils/logger.js";

const userSocketMap = new Map(); // userId -> socketId

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

const socketSetup = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== "undefined") {
      userSocketMap.set(userId, socket.id);
      logger.info(`User connected: ${userId} (${socket.id})`);
      
      // Update user status to online
      await User.findByIdAndUpdate(userId, { status: "online" });
      io.emit("userStatusUpdate", { userId, status: "online" });
    }

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    // Join personal room for notifications
    if (userId) socket.join(userId);

    // Join conversation room
    socket.on("joinChat", (conversationId) => {
      socket.join(conversationId);
      logger.info(`User ${userId} joined chat: ${conversationId}`);
    });

    // Typing indicators
    socket.on("typingStart", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("typingStart", { conversationId, userId });
    });

    socket.on("typingStop", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("typingStop", { conversationId, userId });
    });

    // Message events
    socket.on("sendMessage", (message) => {
      const { conversationId } = message;
      socket.to(conversationId).emit("receiveMessage", message);
    });

    socket.on("messageSeen", async ({ messageId, conversationId, userId }) => {
      // In a real app, you'd update DB here too
      socket.to(conversationId).emit("messageSeen", { messageId, userId });
    });

    socket.on("disconnect", async () => {
      if (userId) {
        userSocketMap.delete(userId);
        logger.info(`User disconnected: ${userId}`);
        
        // Update user status to offline and set lastSeen
        await User.findByIdAndUpdate(userId, { 
          status: "offline", 
          lastSeen: new Date() 
        });
        
        io.emit("userStatusUpdate", { userId, status: "offline", lastSeen: new Date() });
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
      }
    });
  });
};

export default socketSetup;