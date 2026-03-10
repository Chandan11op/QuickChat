import Message from "../models/Message.js";
import { getReceiverSocketId } from "../socket/socket.js";
// Assuming io is accessible globally, or we can export it from server.js.
// Since server.js creates it, we'll export io from server.js and import it here.
import { io } from "../server.js";

export const sendMessage = async (req, res) => {
    try {
        const { text, fileType } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user;

        let fileUrl = "";
        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            fileUrl,
            fileType: fileType || (req.file ? "image" : (fileUrl ? "file" : "text"))
        });

        await newMessage.save();

        // Socket.io functionality to emit message in real time
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive_message", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user; // from authMiddleware

        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId }
            ]
        }).sort({ createdAt: 1 }); // Sort by time

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);
        
        if (!message) return res.status(404).json({ message: "Message not found" });
        if (message.senderId.toString() !== req.user.toString()) {
            return res.status(401).json({ message: "Unauthorized to delete this message" });
        }

        await Message.findByIdAndDelete(id);
        
        // Notify receiver via socket
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("message_deleted", id);
        }

        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const clearChat = async (req, res) => {
    try {
        const { id: friendId } = req.params;
        await Message.deleteMany({
            $or: [
                { senderId: req.user, receiverId: friendId },
                { senderId: friendId, receiverId: req.user }
            ]
        });
        res.json({ message: "Chat cleared successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
};