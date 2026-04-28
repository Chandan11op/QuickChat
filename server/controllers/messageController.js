import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { io } from "../server.js";
import logger from "../utils/logger.js";

export const getConversations = async (req, res) => {
    try {
        const userId = req.user;
        const conversations = await Conversation.find({
            participants: userId
        })
        .populate("participants", "username avatar status lastSeen")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        logger.error("Error in getConversations: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, fileType, conversationId, receiverId } = req.body;
        const senderId = req.user;

        let activeConversationId = conversationId;

        // 1. If no conversationId, check if one exists between these two users
        if (!activeConversationId && receiverId) {
            let conv = await Conversation.findOne({
                isGroup: false,
                participants: { $all: [senderId, receiverId] }
            });

            if (!conv) {
                conv = new Conversation({
                    participants: [senderId, receiverId],
                });
                await conv.save();
            }
            activeConversationId = conv._id;
        }

        let fileUrl = "";
        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        const newMessage = new Message({
            senderId,
            conversationId: activeConversationId,
            text,
            fileUrl,
            fileType: fileType || (req.file ? "image" : (fileUrl ? "file" : "text"))
        });

        await newMessage.save();

        // Update conversation with last message and timestamp
        await Conversation.findByIdAndUpdate(activeConversationId, {
            lastMessage: newMessage._id,
            $inc: { [`unreadCounts.${receiverId}`]: 1 }
        });

        // Emit via socket to the room
        io.to(activeConversationId.toString()).emit("receiveMessage", newMessage);
        
        // Also emit to individual user rooms for sidebar updates if they aren't in the conversation room
        const conv = await Conversation.findById(activeConversationId).populate("participants", "_id");
        conv.participants.forEach(p => {
            io.to(p._id.toString()).emit("newConversationMessage", {
                conversationId: activeConversationId,
                message: newMessage
            });
        });

        res.status(201).json(newMessage);

    } catch (error) {
        logger.error("Error in sendMessage: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        logger.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);
        
        if (!message) return res.status(404).json({ message: "Message not found" });
        if (message.senderId.toString() !== req.user.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await Message.findByIdAndDelete(id);
        io.to(message.conversationId.toString()).emit("messageDeleted", id);

        res.json({ message: "Message deleted" });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const clearChat = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        await Message.deleteMany({ conversationId });
        res.json({ message: "Chat cleared" });
    } catch (err) {
        res.status(500).json(err);
    }
};