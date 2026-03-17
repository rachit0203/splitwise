import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createSettlement,
  getMySettlementHistory,
} from "../controllers/settlementController.js";

const router = express.Router();

router.post("/", authMiddleware, createSettlement);
router.get("/history/me", authMiddleware, getMySettlementHistory);

export default router;
