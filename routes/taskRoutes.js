const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const Task = require("../models/Task");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  shareTask,
  addComment,
  getComments,
  uploadFile,
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

// ================= FILE UPLOAD =================

// UPLOAD ROUTE
router.post("/:id/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("UPLOAD HIT");

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { file: req.file.path },
        { new: true }
      );

      res.json({ message: "Upload success", task });

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;