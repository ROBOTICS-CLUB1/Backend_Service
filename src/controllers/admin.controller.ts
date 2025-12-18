import { Request, Response } from "express";
import User from "../models/User";
import { MailerService } from "../services/mailer.service";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and membership approval
 */

/**
 * @swagger
 * /api/admin/users/pending:
 *   get:
 *     summary: Get all users with pending membership requests
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of pending users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
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
 * @swagger
 * /api/admin/users/{userId}/approve:
 *   patch:
 *     summary: Approve a pending user's membership
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to approve
 *     responses:
 *       200:
 *         description: User approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: User is not pending
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
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

    // Send approval email
    await MailerService.sendApprovalEmail(user.username, user.email);

    return res.json({ message: "User approved", user });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/admin/users/{userId}/reject:
 *   patch:
 *     summary: Reject a pending user's membership
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to reject
 *     responses:
 *       200:
 *         description: User rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: User is not pending
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
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

    // Send rejection email
    await MailerService.sendRejectionEmail(user.username, user.email);

    return res.json({ message: "User rejected", user });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
