import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { getMe, searchUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", requireAuth, getMe);
router.get("/search", requireAuth, searchUsers);
router.get("/:id", requireAuth, getUserById);

export default router;