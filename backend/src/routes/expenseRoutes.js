import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createExpense,
  getExpensesByGroup,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

router.post("/create", authMiddleware, createExpense);
router.get("/group/:groupId", authMiddleware, getExpensesByGroup);
router.put("/:id", authMiddleware, updateExpense);
router.delete("/:id", authMiddleware, deleteExpense);

export default router;
