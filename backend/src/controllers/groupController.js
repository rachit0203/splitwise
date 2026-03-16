const Group = require("../models/Group");
const User = require("../models/User");

const createGroup = async (req, res) => {
  try {
    const { name, members = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const uniqueMembers = Array.from(
      new Set([...members, req.user._id.toString()]),
    );

    const usersCount = await User.countDocuments({
      _id: { $in: uniqueMembers },
    });
    if (usersCount !== uniqueMembers.length) {
      return res
        .status(400)
        .json({ message: "One or more members are invalid" });
    }

    const group = await Group.create({
      name,
      members: uniqueMembers,
      createdBy: req.user._id,
    });

    const populated = await Group.findById(group._id)
      .populate("members", "name email")
      .populate("createdBy", "name email");

    return res.status(201).json({ group: populated });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create group", error: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("createdBy", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (
      !group.members.some(
        (member) => member._id.toString() === req.user._id.toString(),
      )
    ) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    return res.status(200).json({ group });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch group", error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.body;

    if (!groupId || !memberId) {
      return res
        .status(400)
        .json({ message: "groupId and memberId are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (
      !group.members.some(
        (member) => member.toString() === req.user._id.toString(),
      )
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this group" });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member user not found" });
    }

    if (!group.members.some((m) => m.toString() === memberId)) {
      group.members.push(memberId);
      await group.save();
    }

    const populated = await Group.findById(group._id)
      .populate("members", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({ group: populated });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to add member", error: error.message });
  }
};

const listMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .sort({ createdAt: -1 })
      .populate("members", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({ groups });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch groups", error: error.message });
  }
};

module.exports = {
  createGroup,
  getGroupById,
  addMember,
  listMyGroups,
};
