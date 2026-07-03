const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
  },
});

// Verify transporter asynchronously (non-blocking)
setImmediate(() => {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email service error:", error.message);
    } else {
      console.log("✅ Email service is ready");
    }
  });
});

// Send email function
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `Task Manager <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("📧 Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

module.exports = sendEmail;