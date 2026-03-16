const User = require("../models/User");

const searchUsers = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();

    if (!query) {
      return res.status(200).json({ users: [] });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("name email")
      .limit(20);

    return res.status(200).json({ users });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "User search failed", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name email friends createdAt",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

module.exports = {
  searchUsers,
  getUserById,
};
