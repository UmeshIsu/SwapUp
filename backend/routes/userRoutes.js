const express = require("express");
const { updateProfile, changePassword } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.put("/profile", authMiddleware, updateProfile);
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
