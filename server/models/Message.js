import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/crypto.js";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt
  },
  type: {
    type: String,
    enum: ["text", "image", "video", "file", "audio"],
    default: "text"
  },
  fileUrl: {
    type: String,
    default: "",
    set: encrypt,
    get: decrypt
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent"
  },
  reactions: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      emoji: { type: String }
    }
  ],
  isDisappearing: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    index: { expires: 0 } // TTL index: documents will be deleted when current date > expiresAt
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Index for pagination and sorting
messageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);