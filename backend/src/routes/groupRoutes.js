import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  createGroup,
  getGroupById,
  addMember,
  listMyGroups,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", requireAuth, createGroup);
router.get("/my", requireAuth, listMyGroups);
router.get("/:id", requireAuth, getGroupById);
router.post("/add-member", requireAuth, addMember);

export default router;
