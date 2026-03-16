const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getUserBalance } = require("../controllers/balanceController");

const router = express.Router();

router.get("/user/:id", authMiddleware, getUserBalance);

module.exports = router;
