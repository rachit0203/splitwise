import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/User.js";

/**
 * Clerk auth middleware.
 * Verifies the Bearer token from Clerk, resolves the Clerk user,
 * finds-or-creates a matching MongoDB user, and sets req.user.
 */
const requireAuth = async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find existing user by clerkUserId
    let user = await User.findOne({ clerkUserId });

    if (!user) {
      // First-time login: fetch profile from Clerk and create a DB record
      try {
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
        const name =
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
          "User";

        user = await User.create({ clerkUserId, name, email });
      } catch (createError) {
        console.error("Failed to create user from Clerk:", createError.message);
        return res
          .status(500)
          .json({ message: "Could not provision user account" });
      }
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized", error: error.message });
  }
};

export default requireAuth;
