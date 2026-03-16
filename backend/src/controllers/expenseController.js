const Expense = require("../models/Expense");
const Group = require("../models/Group");
const {
  getParticipantShare,
  toTwoDecimals,
} = require("../services/balanceService");

const validateAndNormalizeParticipants = (splitType, amount, participants) => {
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new Error("participants are required");
  }

  const normalized = participants.map((item) => ({
    user: item.user,
    share: Number(item.share || 0),
    percentage: Number(item.percentage || 0),
    exactAmount: Number(item.exactAmount || 0),
  }));

  if (splitType === "equal") {
    const equalShare = toTwoDecimals(amount / normalized.length);
    return normalized.map((item) => ({ ...item, share: equalShare }));
  }

  if (splitType === "unequal") {
    const sum = toTwoDecimals(
      normalized.reduce((acc, item) => acc + item.share, 0),
    );
    if (sum !== toTwoDecimals(amount)) {
      throw new Error("Sum of unequal shares must match amount");
    }
    return normalized;
  }

  if (splitType === "percentage") {
    const percentSum = toTwoDecimals(
      normalized.reduce((acc, item) => acc + item.percentage, 0),
    );
    if (percentSum !== 100) {
      throw new Error("Percentage split must total 100");
    }
    return normalized;
  }

  if (splitType === "exact") {
    const exactSum = toTwoDecimals(
      normalized.reduce((acc, item) => acc + item.exactAmount, 0),
    );
    if (exactSum !== toTwoDecimals(amount)) {
      throw new Error("Exact split amounts must match amount");
    }
    return normalized;
  }

  throw new Error("Invalid splitType");
};

const createExpense = async (req, res) => {
  try {
    const {
      description,
      amount,
      paidBy,
      participants,
      splitType = "equal",
      groupId,
    } = req.body;

    if (!description || !amount || !paidBy || !groupId) {
      return res.status(400).json({
        message: "description, amount, paidBy and groupId are required",
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const allUsers = [paidBy, ...participants.map((p) => p.user)].map((id) =>
      id.toString(),
    );
    const invalid = allUsers.some(
      (id) => !group.members.some((memberId) => memberId.toString() === id),
    );

    if (invalid) {
      return res
        .status(403)
        .json({ message: "Users must be members of the group" });
    }

    const normalizedParticipants = validateAndNormalizeParticipants(
      splitType,
      Number(amount),
      participants,
    );

    const expense = await Expense.create({
      description,
      amount: Number(amount),
      paidBy,
      participants: normalizedParticipants,
      splitType,
      groupId,
      createdBy: req.user._id,
    });

    const populated = await Expense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("participants.user", "name email")
      .populate("createdBy", "name email");

    return res.status(201).json({ expense: populated });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Failed to create expense", error: error.message });
  }
};

const getExpensesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (
      !group.members.some((id) => id.toString() === req.user._id.toString())
    ) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const expenses = await Expense.find({ groupId })
      .sort({ createdAt: -1 })
      .populate("paidBy", "name email")
      .populate("participants.user", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({ expenses });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch expenses", error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const group = await Group.findById(expense.groupId);
    if (
      !group ||
      !group.members.some((id) => id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { description, amount, paidBy, participants, splitType } = req.body;

    if (description) {
      expense.description = description;
    }

    if (amount) {
      expense.amount = Number(amount);
    }

    if (paidBy) {
      expense.paidBy = paidBy;
    }

    if (splitType) {
      expense.splitType = splitType;
    }

    if (participants) {
      expense.participants = validateAndNormalizeParticipants(
        expense.splitType,
        expense.amount,
        participants,
      );
    }

    if (participants || splitType || amount) {
      const totalCheck = expense.participants.reduce(
        (sum, participant) => sum + getParticipantShare(participant, expense),
        0,
      );

      if (toTwoDecimals(totalCheck) !== toTwoDecimals(expense.amount)) {
        return res
          .status(400)
          .json({ message: "Split values do not match expense amount" });
      }
    }

    await expense.save();

    const updated = await Expense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("participants.user", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({ expense: updated });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Failed to update expense", error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only creator can delete expense" });
    }

    await expense.deleteOne();

    return res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete expense", error: error.message });
  }
};

module.exports = {
  createExpense,
  getExpensesByGroup,
  updateExpense,
  deleteExpense,
};
