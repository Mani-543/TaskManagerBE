const Task = require("../models/Task");

// ================= TASK REPORT =================
exports.getTaskReport = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total tasks
    const totalTasks = await Task.countDocuments({ assignedTo: userId });

    // Completed tasks
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Completed",
    });

    // Pending tasks
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Pending",
    });

    // In Progress tasks
    const inProgressTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "In Progress",
    });

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      deadline: { $lt: new Date() },
      status: { $ne: "Completed" },
    });

    // Completion rate
    const completionRate =
      totalTasks === 0
        ? 0
        : ((completedTasks / totalTasks) * 100).toFixed(2);

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error generating report",
      error: error.message,
    });
  }
};