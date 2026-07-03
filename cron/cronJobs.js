const cron = require("node-cron");
const Task = require("../models/Task");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

// Run every hour (optimized for batch processing)
cron.schedule("0 * * * *", async () => {
  console.log("⏰ Checking task reminders...");

  try {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    // Use lean() for read-only queries
    const tasks = await Task.find({
      deadline: { $lte: tomorrow, $gte: now },
      status: { $ne: "Completed" },
    })
      .populate("assignedTo", "email")
      .lean()
      .exec();

    // Batch send emails without blocking
    const emailPromises = tasks
      .filter((task) => task.assignedTo?.email)
      .map((task) =>
        sendEmail(
          task.assignedTo.email,
          "⏰ Task Reminder",
          `Task "${task.title}" is due on ${task.deadline}`
        ).catch((err) => console.log("Email error:", err.message))
      );

    // Fire and forget
    setImmediate(() => {
      Promise.all(emailPromises).catch((err) =>
        console.log("Batch email error:", err.message)
      );
    });

    console.log(`✅ Scheduled ${tasks.length} reminder emails`);
  } catch (err) {
    console.log("❌ Cron Error:", err.message);
  }
});