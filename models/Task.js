const mongoose = require("mongoose");

// ================= COMMENT SCHEMA =================
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    required: true,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ================= TASK SCHEMA =================
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    deadline: {
      type: Date,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    category: {
      type: String,
      default: "General",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 🔗 Task Sharing
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
      },
    ],

      // ✅ FIXED COMMENTS SCHEMA
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",   // 🔥 THIS IS REQUIRED
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
    // 📎 Attachments
    attachments: [
      {
        filename: String,
        filepath: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);