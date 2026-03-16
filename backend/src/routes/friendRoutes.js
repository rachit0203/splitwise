const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendFriendRequest,
  acceptOrRejectRequest,
  getFriendList,
} = require("../controllers/friendController");

const router = express.Router();

router.post("/request", authMiddleware, sendFriendRequest);
router.post("/accept", authMiddleware, acceptOrRejectRequest);
router.get("/list", authMiddleware, getFriendList);

module.exports = router;
