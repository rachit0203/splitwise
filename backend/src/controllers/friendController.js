import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "receiverId is required" });
    }

    if (senderId.toString() === receiverId) {
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const sender = await User.findById(senderId);
    if (sender.friends.some((friendId) => friendId.toString() === receiverId)) {
      return res.status(409).json({ message: "Already friends" });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId, status: "pending" },
        { sender: receiverId, receiver: senderId, status: "pending" },
      ],
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Friend request already pending" });
    }

    const request = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
    });
    return res.status(201).json({ request });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to send request", error: error.message });
  }
};

const acceptOrRejectRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: "requestId is required" });
    }

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (friendRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Friend request already processed" });
    }

    if (action === "reject") {
      friendRequest.status = "rejected";
      await friendRequest.save();
      return res
        .status(200)
        .json({ message: "Friend request rejected", request: friendRequest });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.updateOne(
      { _id: friendRequest.sender },
      { $addToSet: { friends: friendRequest.receiver } },
    );

    await User.updateOne(
      { _id: friendRequest.receiver },
      { $addToSet: { friends: friendRequest.sender } },
    );

    return res
      .status(200)
      .json({ message: "Friend request accepted", request: friendRequest });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to process request", error: error.message });
  }
};

const getFriendList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "name email",
    );

    const pendingReceived = await FriendRequest.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "name email");

    const pendingSent = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate("receiver", "name email");

    return res.status(200).json({
      friends: user.friends,
      pendingReceived,
      pendingSent,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch friends", error: error.message });
  }
};

export {
  sendFriendRequest,
  acceptOrRejectRequest,
  getFriendList,
};