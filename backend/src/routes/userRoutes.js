import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { searchUsers, getUserById } from "../controllers/userController.js";
const router = express.Router();

router.get("/search", authMiddleware, searchUsers);
router.get("/:id", authMiddleware, getUserById);

export default router;