import mongoose from "mongoose";

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
  },
  groupAvatar: {
    type: String,
    default: ""
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
}, { timestamps: true });

// Index for faster lookups by participant
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
