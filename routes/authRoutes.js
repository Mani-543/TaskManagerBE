const express = require("express");
const router = express.Router();

// controllers
const { register, login } = require("../controllers/authController");

// ================= AUTH ROUTES =================

// Register
router.post("/register", register);

// Login
router.post("/login", login);

module.exports = router;