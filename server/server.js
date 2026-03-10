import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import path from "path"
import { fileURLToPath } from 'url'
import fs from "fs"

import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import socketSetup from "./socket/socket.js"
import messageRoutes from "./routes/messageRoutes.js"

dotenv.config()

const app = express()
const server = http.createServer(app)
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Assuming default Vite port, update if different
    methods: ["GET", "POST"]
  }
})

connectDB()

app.use(cors())
app.use(express.json())

// Serve static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static(uploadDir))

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/messages", messageRoutes)

app.get("/", (req,res)=>{
  res.send("QuickChat API & Socket Running")
})

// Initialize Socket event listeners
socketSetup(io)

const PORT = process.env.PORT || 5000

server.listen(PORT, ()=>{
  console.log(`Server and Socket running on port ${PORT}`)
})