import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/crypto.js";

const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reportedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reason: {
        type: String,
        required: true,
        set: encrypt,
        get: decrypt
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "resolved"],
        default: "pending"
    }
}, { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

export default mongoose.model("Report", reportSchema);
