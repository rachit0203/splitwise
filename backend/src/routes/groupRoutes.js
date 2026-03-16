import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createGroup,
  getGroupById,
  addMember,
  listMyGroups,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", authMiddleware, createGroup);
router.get("/my", authMiddleware, listMyGroups);
router.get("/:id", authMiddleware, getGroupById);
router.post("/add-member", authMiddleware, addMember);

export default router;