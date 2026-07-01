import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { encrypt, decrypt } from "../utils/crypto.js";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId;
    },
    trim: true,
    set: encrypt,
    get: decrypt
  },
  contactNumber: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId;
    },
    trim: true,
    set: encrypt,
    get: decrypt
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
    set: encrypt,
    get: decrypt
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
    set: encrypt,
    get: decrypt
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId;
    }
  },
  dob: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId;
    },
    set: encrypt,
    get: decrypt
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    default: "",
    set: encrypt,
    get: decrypt
  },
  bio: {
    type: String,
    default: "",
    maxlength: 160,
    set: encrypt,
    get: decrypt
  },
  status: {
    type: String,
    enum: ["online", "offline", "away"],
    default: "offline"
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  friendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  blockedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  theme: {
    type: String,
    enum: ["dark", "light", "system"],
    default: "dark"
  },
  accentColor: {
    type: String,
    default: "#3b82f6", // Default blue
    set: encrypt,
    get: decrypt
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexing for faster searches
userSchema.index({ username: "text", email: "text" });

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);