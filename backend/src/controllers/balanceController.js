import { calculateUserBalances } from "../services/balanceService.js";
const getUserBalance = async (req, res) => {
  try {
    const { id } = req.params;

    if (id !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only view your own balance" });
    }

    const data = await calculateUserBalances(id);
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to calculate balances", error: error.message });
  }
};

export {
  getUserBalance,
};