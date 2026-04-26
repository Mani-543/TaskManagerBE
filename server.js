require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ✅ USE /tmp FOR RENDER
const uploadPath = "/tmp/uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DB =================
connectDB();

// ================= STATIC =================
app.use("/uploads", express.static(uploadPath));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// ROOT
app.get("/", (req, res) => {
  res.send("Task Manager API is running 🚀");
});

// CRON
require("./cron/cronJobs");

// SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});