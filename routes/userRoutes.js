const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
// GET ALL USERS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("_id name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;