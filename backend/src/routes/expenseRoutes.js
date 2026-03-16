const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createExpense,
  getExpensesByGroup,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const router = express.Router();

router.post("/create", authMiddleware, createExpense);
router.get("/group/:groupId", authMiddleware, getExpensesByGroup);
router.put("/:id", authMiddleware, updateExpense);
router.delete("/:id", authMiddleware, deleteExpense);

module.exports = router;
