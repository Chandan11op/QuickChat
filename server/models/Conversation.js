import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/crypto.js";

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  isGroup: {
    type: Boolean,
    default: false,
  },
  groupName: {
    type: String,
    trim: true,
    set: encrypt,
    get: decrypt
  },
  groupAvatar: {
    type: String,
    default: "",
    set: encrypt,
    get: decrypt
  },
  groupAdmin: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Index for faster lookups by participant
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
