import Expense from "../models/Expense.js";
import Settlement from "../models/Settlement.js";
import User from "../models/User.js";
const toTwoDecimals = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const getParticipantShare = (participant, expense) => {
  if (expense.splitType === "percentage") {
    return (expense.amount * (participant.percentage || 0)) / 100;
  }

  if (expense.splitType === "exact") {
    return participant.exactAmount || 0;
  }

  if (expense.splitType === "equal") {
    return expense.amount / expense.participants.length;
  }

  return participant.share || 0;
};

const calculateUserBalances = async (userId) => {
  const expenses = await Expense.find({
    $or: [{ paidBy: userId }, { "participants.user": userId }],
  })
    .populate("paidBy", "name email")
    .populate("participants.user", "name email");

  const settlements = await Settlement.find({
    $or: [{ payer: userId }, { receiver: userId }],
  })
    .populate("payer", "name email")
    .populate("receiver", "name email");

  const relationMap = new Map();

  const getKey = (id) => id.toString();

  const addBalance = (counterParty, delta, source) => {
    const key = getKey(counterParty._id || counterParty);
    const current = relationMap.get(key) || {
      user: counterParty,
      balance: 0,
      sources: [],
    };
    current.balance = toTwoDecimals(current.balance + delta);
    current.sources.push(source);
    relationMap.set(key, current);
  };

  expenses.forEach((expense) => {
    const payerId = expense.paidBy._id.toString();

    expense.participants.forEach((participant) => {
      const participantId = participant.user._id.toString();
      if (participantId === payerId) {
        return;
      }

      const share = toTwoDecimals(getParticipantShare(participant, expense));

      if (payerId === userId.toString()) {
        addBalance(participant.user, share, {
          type: "expense",
          expenseId: expense._id.toString(),
        });
      }

      if (participantId === userId.toString()) {
        addBalance(expense.paidBy, -share, {
          type: "expense",
          expenseId: expense._id.toString(),
        });
      }
    });
  });

  settlements.forEach((settlement) => {
    const payerId = settlement.payer._id.toString();
    const receiverId = settlement.receiver._id.toString();
    const amount = toTwoDecimals(settlement.amount);

    if (payerId === userId.toString()) {
      addBalance(settlement.receiver, amount, {
        type: "settlement",
        settlementId: settlement._id.toString(),
      });
    }

    if (receiverId === userId.toString()) {
      addBalance(settlement.payer, -amount, {
        type: "settlement",
        settlementId: settlement._id.toString(),
      });
    }
  });

  const balances = Array.from(relationMap.values())
    .filter((item) => Math.abs(item.balance) > 0)
    .map((item) => ({
      user: {
        _id: item.user._id,
        name: item.user.name,
        email: item.user.email,
      },
      balance: toTwoDecimals(item.balance),
      status: item.balance > 0 ? "owes_you" : "you_owe",
    }));

  const youAreOwed = toTwoDecimals(
    balances
      .filter((b) => b.balance > 0)
      .reduce((sum, b) => sum + b.balance, 0),
  );
  const youOwe = toTwoDecimals(
    Math.abs(
      balances
        .filter((b) => b.balance < 0)
        .reduce((sum, b) => sum + b.balance, 0),
    ),
  );

  const user = await User.findById(userId).select("name email");

  return {
    user,
    summary: {
      totalBalance: toTwoDecimals(youAreOwed - youOwe),
      youAreOwed,
      youOwe,
    },
    balances,
    simplified: balances.map((item) => {
      if (item.balance > 0) {
        return `${item.user.name} owes you ${item.balance}`;
      }
      return `You owe ${item.user.name} ${Math.abs(item.balance)}`;
    }),
  };
};

export {
  calculateUserBalances,
  getParticipantShare,
  toTwoDecimals,
};