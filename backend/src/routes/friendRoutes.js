import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  sendFriendRequest,
  acceptOrRejectRequest,
  getFriendList,
} from "../controllers/friendController.js";

const router = express.Router();

router.post("/request", requireAuth, sendFriendRequest);
router.post("/accept", requireAuth, acceptOrRejectRequest);
router.get("/list", requireAuth, getFriendList);

export default router;
