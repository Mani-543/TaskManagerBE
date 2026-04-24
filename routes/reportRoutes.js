// routes/reportRoutes.js

const express = require("express");
const router = express.Router();

const { getTaskReport } = require("../controllers/reportController");
const authMiddleware = require("../middleware/auth");

// ================= REPORT ROUTES =================

// Get dashboard report
router.get("/summary", authMiddleware, getTaskReport);

module.exports = router;