import express from "express";
import { sendMessage, getMessages, deleteMessage, clearChat, getConversations, createGroup } from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/conversations", authMiddleware, getConversations);
router.get("/:id", authMiddleware, getMessages);
router.post("/send", authMiddleware, upload.single("file"), sendMessage);
router.post("/create-group", authMiddleware, createGroup);
router.delete("/delete/:id", authMiddleware, deleteMessage);
router.delete("/clear/:id", authMiddleware, clearChat);

export default router;