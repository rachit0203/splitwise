import Settlement from "../models/Settlement.js";
const createSettlement = async (req, res) => {
  try {
    const { payer, receiver, amount, groupId } = req.body;

    if (!payer || !receiver || !amount) {
      return res
        .status(400)
        .json({ message: "payer, receiver and amount are required" });
    }

    if (payer !== req.user._id.toString()) {
      return res.status(403).json({ message: "Logged-in user must be payer" });
    }

    const settlement = await Settlement.create({
      payer,
      receiver,
      amount: Number(amount),
      groupId,
    });

    const populated = await Settlement.findById(settlement._id)
      .populate("payer", "name email")
      .populate("receiver", "name email")
      .populate("groupId", "name");

    return res.status(201).json({ settlement: populated });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create settlement", error: error.message });
  }
};

const getMySettlementHistory = async (req, res) => {
  try {
    const settlements = await Settlement.find({
      $or: [{ payer: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate("payer", "name email")
      .populate("receiver", "name email")
      .populate("groupId", "name");

    return res.status(200).json({ settlements });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch settlements", error: error.message });
  }
};

export {
  createSettlement,
  getMySettlementHistory,
};