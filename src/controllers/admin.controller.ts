import { Request, Response } from "express";
import User from "../models/User";
import { signToken } from "../utils/jwt";

/**
 * Get all users with pending membership requests
 */
export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const pendingUsers = await User.find({ membershipStatus: "pending" });
    return res.json(pendingUsers);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Approve a pending user's membership
 */
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.membershipStatus !== "pending")
      return res.status(400).json({ message: "User is not pending" });

    user.membershipStatus = "approved";
    user.role = "member";
    user.membershipReviewedAt = new Date();
    await user.save();

    // Optional: send approval email here

    return res.json({ message: "User approved", user });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Reject a pending user's membership
 */
export const rejectUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.membershipStatus !== "pending")
      return res.status(400).json({ message: "User is not pending" });

    user.membershipStatus = "rejected";
    user.membershipReviewedAt = new Date();
    await user.save();

    // Optional: send rejection email here

    return res.json({ message: "User rejected", user });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
