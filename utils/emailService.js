const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter (optional but recommended)
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email service error:", error.message);
  } else {
    console.log("✅ Email service is ready");
  }
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