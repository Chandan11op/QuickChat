import User from "../models/User.js";
import Report from "../models/Report.js";
import bcrypt from "bcryptjs";

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        
        const avatarPath = req.file.filename;
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const user = await User.findByIdAndUpdate(
            req.user,
            { avatar: `${baseUrl}/uploads/${avatarPath}` },
            { new: true }
        );
        
        res.json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user);
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid current password" });
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getFriendRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user).populate("friendRequests", "username email avatar");
        res.json(user.friendRequests);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { username, bio, fullName, contactNumber, dob } = req.body;
        
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username !== undefined) user.username = username;
        if (bio !== undefined) user.bio = bio;
        if (fullName !== undefined) user.fullName = fullName;
        if (contactNumber !== undefined) user.contactNumber = contactNumber;
        if (dob !== undefined) user.dob = dob;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json(err);
    }
};

export const searchUsers = async (req, res) => {
    try {
        const searchVal = req.query.search ? req.query.search.trim().toLowerCase() : "";
        
        // Fetch all users except the current user
        const allUsers = await User.find({ _id: { $ne: req.user } });
        
        // Filter in memory since fields are encrypted in the database
        const filteredUsers = allUsers.filter(user => {
            if (!searchVal) return true;
            const username = (user.username || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            const fullName = (user.fullName || "").toLowerCase();
            const contactNumber = (user.contactNumber || "").toLowerCase();
            return username.includes(searchVal) || 
                   email.includes(searchVal) || 
                   fullName.includes(searchVal) || 
                   contactNumber.includes(searchVal);
        });

        res.json(filteredUsers);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const sendFriendRequest = async(req, res) => {
    try {
        const { id } = req.body; // User ID to send request to
        const receiver = await User.findById(id);
        
        if (!receiver.friendRequests.includes(req.user) && !receiver.friends.includes(req.user)) {
             receiver.friendRequests.push(req.user);
             await receiver.save();
             return res.json({ message: "Friend request sent" });
        }
        res.status(400).json({ message: "Request already sent or user is already a friend" });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const acceptFriendRequest = async(req, res) => {
    try {
        const { id } = req.body; // ID of user who sent the request
        
        const currentUser = await User.findById(req.user);
        const requestSender = await User.findById(id);

        if (currentUser.friendRequests.includes(id)) {
             currentUser.friends.push(id);
             currentUser.friendRequests = currentUser.friendRequests.filter(reqId => reqId.toString() !== id.toString());
             await currentUser.save();

             requestSender.friends.push(req.user);
             await requestSender.save();
             return res.json({ message: "Friend request accepted" });
        }
        res.status(400).json({ message: "No request found" });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getFriends = async(req, res) => {
    try {
        const user = await User.findById(req.user).populate("friends", "username email avatar bio");
        res.json(user.friends);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const blockUser = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await User.findById(req.user);
        if (!user.blockedUsers.includes(id)) {
            user.blockedUsers.push(id);
            await user.save();
            return res.json({ message: "User blocked successfully" });
        }
        res.status(400).json({ message: "User already blocked" });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const unblockUser = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await User.findById(req.user);
        user.blockedUsers = user.blockedUsers.filter(uid => uid.toString() !== id.toString());
        await user.save();
        res.json({ message: "User unblocked successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const reportUser = async (req, res) => {
    try {
        const { reportedId, reason } = req.body;
        const reporterId = req.user;

        const newReport = new Report({
            reporterId,
            reportedId,
            reason
        });

        await newReport.save();
        res.json({ message: "User reported successfully. Our team will review it." });
    } catch (err) {
        res.status(500).json(err);
    }
};