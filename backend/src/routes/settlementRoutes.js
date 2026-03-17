import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  createSettlement,
  getMySettlementHistory,
} from "../controllers/settlementController.js";

const router = express.Router();

router.post("/", requireAuth, createSettlement);
router.get("/history/me", requireAuth, getMySettlementHistory);

export default router;
