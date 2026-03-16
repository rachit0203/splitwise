import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getUserBalance } from "../controllers/balanceController.js";
const router = express.Router();

router.get("/user/:id", authMiddleware, getUserBalance);

export default router;