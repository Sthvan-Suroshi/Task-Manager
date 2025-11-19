import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import authRoutes from "./src/routes/authRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
global.io = io;
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Socket.io authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.userId} joined project ${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(projectId);
    console.log(`User ${socket.userId} left project ${projectId}`);
  });

  socket.on('cursor-move', (data) => {
    // Broadcast to others in the project
    socket.to(data.projectId).emit('cursor-update', {
      userId: socket.userId,
      x: data.x,
      y: data.y,
      name: data.name
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/taskmanager")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
