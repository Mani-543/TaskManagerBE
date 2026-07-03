const Task = require("../models/Task");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");


// ================= CREATE TASK =================
exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.user.id,
    });

    const savedTask = await task.save();

    // Send response immediately
    res.status(201).json(savedTask);

    // Send email in background (non-blocking with setImmediate)
    if (task.assignedTo) {
      setImmediate(async () => {
        try {
          const user = await User.findById(task.assignedTo).select("email").lean();
          if (user?.email) {
            await sendEmail(
              user.email,
              "New Task Assigned",
              `You have been assigned: ${task.title}`
            );
          }
        } catch (err) {
          console.log("EMAIL ERROR:", err.message);
        }
      });
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET TASKS =================


const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Use lean() for read-only queries for better performance
    const tasks = await Task.find({
      $or: [
        { createdBy: userId },                 // tasks created by user
        { assignedTo: userId },                // tasks assigned to user
        { "sharedWith.user": userId },         // shared tasks
      ],
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("sharedWith.user", "name email")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(tasks);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};
exports.getTasks = getTasks;

// ================= GET TASK BY ID =================
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("comments.user", "name email")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("sharedWith.user", "name email")
      .lean()
      .exec();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= UPDATE TASK =================

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = req.user.id;

    // 🔥 CHECK OWNER
    const isCreator = task.createdBy.toString() === userId;

    // 🔥 CHECK SHARED PERMISSION
    const sharedUser = task.sharedWith.find(
      (s) => s.user.toString() === userId
    );

    const isEditor =
      sharedUser && sharedUser.permission === "edit";

    // ❌ BLOCK IF ONLY VIEW
    if (!isCreator && !isEditor) {
      return res.status(403).json({
        message: "View-only access. Editing not allowed ❌",
      });
    }

    // ✅ ALLOW UPDATE
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTask);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE TASK =================
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//sharetask
exports.shareTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { userId, permission } = req.body;

    // Check if already shared
    const task = await Task.findById(taskId).lean().exec();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const alreadyShared = task.sharedWith?.find(
      (s) => s.user.toString() === userId
    );

    if (alreadyShared) {
      // Update existing share permission
      await Task.updateOne(
        { _id: taskId, "sharedWith.user": userId },
        { $set: { "sharedWith.$.permission": permission || "view" } }
      );
    } else {
      // Add new share
      await Task.updateOne(
        { _id: taskId },
        {
          $push: {
            sharedWith: {
              user: userId,
              permission: permission || "view",
            },
          },
        }
      );
    }

    res.json({ message: "Task shared successfully ✅" });
  } catch (err) {
    console.log("SHARE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    // Use atomic update for better performance
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.user.id,
            text: req.body.text,
          },
        },
      },
      { new: true }
    ).populate("comments.user", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task.comments);
  } catch (err) {
    console.log("ADD COMMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

//get comments
exports.getComments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("comments.user", "name email")
      .lean()
      .exec();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comments = task.comments || [];

    res.json(comments);
  } catch (err) {
    console.log("GET COMMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= PROFILE =================

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log("PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updateData = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.body.password) {
      updateData.password = req.body.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};