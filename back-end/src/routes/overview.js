const express = require("express");
const { getStats } = require("../controllers/overviewController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", authenticate, getStats);

module.exports = router;
