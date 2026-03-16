const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { searchUsers, getUserById } = require("../controllers/userController");

const router = express.Router();

router.get("/search", authMiddleware, searchUsers);
router.get("/:id", authMiddleware, getUserById);

module.exports = router;
