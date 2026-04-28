import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export const profileUpdateSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  bio: z.string().max(160).optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional()
});

export const messageSchema = z.object({
  conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid conversation ID"),
  content: z.string().min(1, "Message cannot be empty"),
  type: z.enum(["text", "image", "video", "file", "audio"]).optional(),
  isDisappearing: z.boolean().optional(),
  duration: z.number().optional() // for disappearing messages
});
