import express from "express";
import { sendMessage, getMessages, deleteMessage, clearChat } from "../controllers/messageController.js";
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

router.get("/:id", authMiddleware, getMessages);
router.post("/send/:id", authMiddleware, upload.single("file"), sendMessage);
router.delete("/delete/:id", authMiddleware, deleteMessage);
router.delete("/clear/:id", authMiddleware, clearChat);

export default router;