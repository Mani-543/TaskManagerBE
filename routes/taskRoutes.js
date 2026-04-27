const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/auth");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  shareTask,
  addComment,
  getComments,
  getProfile,
  updateProfile,
} = require("../controllers/taskController");

// ================= TASK CRUD =================
router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getTasks);

// ================= PROFILE =================
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// ================= TASK =================
router.get("/:id", authMiddleware, getTaskById);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

// ================= SHARE =================
router.post("/:id/share", authMiddleware, shareTask);

// ================= COMMENTS =================
router.post("/:id/comments", authMiddleware, addComment);
router.get("/:id/comments", authMiddleware, getComments);



module.exports = router;