const cron = require("node-cron");
const Task = require("../models/Task");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

// Run every minute (for testing)
cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking task reminders...");

  try {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const tasks = await Task.find({
      deadline: { $lte: tomorrow, $gte: now },
      status: { $ne: "Completed" },
    });

    for (const task of tasks) {
      if (!task.assignedTo) continue;

      const user = await User.findById(task.assignedTo);

      if (user?.email) {
        await sendEmail(
          user.email,
          "⏰ Task Reminder",
          `Task "${task.title}" is due on ${task.deadline}`
        );
      }
    }

    console.log(`✅ Checked ${tasks.length} tasks`);
  } catch (err) {
    console.log("❌ Cron Error:", err.message);
  }
});