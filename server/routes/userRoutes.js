import express from "express";
import upload from "../middleware/upload.js";
import auth from "../middleware/authMiddleware.js";
import {
  updateProfile,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getFriendRequests,
  uploadAvatar,
  changePassword,
  blockUser,
  unblockUser,
  reportUser
} from "../controllers/userController.js";

const router = express.Router();

router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

router.post(
  "/upload-avatar",
  auth,
  upload.single("avatar"),
  uploadAvatar
);

router.get("/search", auth, searchUsers);
router.post("/send-request", auth, sendFriendRequest);
router.post("/accept-request", auth, acceptFriendRequest);
router.get("/friends", auth, getFriends);
router.get("/friend-requests", auth, getFriendRequests);
router.post("/block-user", auth, blockUser);
router.post("/unblock-user", auth, unblockUser);
router.post("/report-user", auth, reportUser);

export default router;