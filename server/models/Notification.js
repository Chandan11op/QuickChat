import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/crypto.js";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ["message", "friend_request", "friend_accept", "group_invite"],
    required: true
  },
  content: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

export default mongoose.model("Notification", notificationSchema);
