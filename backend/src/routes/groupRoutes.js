const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createGroup,
  getGroupById,
  addMember,
  listMyGroups,
} = require("../controllers/groupController");

const router = express.Router();

router.post("/create", authMiddleware, createGroup);
router.get("/my", authMiddleware, listMyGroups);
router.get("/:id", authMiddleware, getGroupById);
router.post("/add-member", authMiddleware, addMember);

module.exports = router;
