const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createSettlement,
  getMySettlementHistory,
} = require("../controllers/settlementController");

const router = express.Router();

router.post("/", authMiddleware, createSettlement);
router.get("/history/me", authMiddleware, getMySettlementHistory);

module.exports = router;
