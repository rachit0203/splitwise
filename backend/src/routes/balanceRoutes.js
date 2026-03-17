import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { getUserBalance } from "../controllers/balanceController.js";
const router = express.Router();

router.get("/user/:id", requireAuth, getUserBalance);

export default router;