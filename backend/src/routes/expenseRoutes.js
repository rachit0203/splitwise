import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  createExpense,
  getExpensesByGroup,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

router.post("/create", requireAuth, createExpense);
router.get("/group/:groupId", requireAuth, getExpensesByGroup);
router.put("/:id", requireAuth, updateExpense);
router.delete("/:id", requireAuth, deleteExpense);

export default router;
