import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  sendFriendRequest,
  acceptOrRejectRequest,
  getFriendList,
} from "../controllers/friendController.js";

const router = express.Router();

router.post("/request", authMiddleware, sendFriendRequest);
router.post("/accept", authMiddleware, acceptOrRejectRequest);
router.get("/list", authMiddleware, getFriendList);

export default router;