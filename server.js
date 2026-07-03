require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ================= MIDDLEWARE =================
app.use(compression());

// ================= CORS CONFIGURATION =================
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    process.env.FRONTEND_URL || "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours - cache preflight
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));

// ================= DB =================
connectDB();

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);


// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("Task Manager API is running 🚀");
});

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// ================= CRON =================
require("./cron/cronJobs");

// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});