const express = require("express");
const { getMyShifts } = require("../controllers/shiftController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/my", authMiddleware, getMyShifts);

module.exports = router;
