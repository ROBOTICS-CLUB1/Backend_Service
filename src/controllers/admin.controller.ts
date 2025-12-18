import { Request, Response } from "express";
import User from "../models/User";
import Post from "../models/Post";
import Project from "../models/Project";
import Tag from "../models/Tag";
import { MailerService } from "../services/mailer.service";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management, membership approval, and dashboard metrics
 */

/**
 * @swagger
 * /api/admin/users/pending:
 *   get:
 *     summary: Get all users with pending membership requests
 *     description: Returns a list of users awaiting membership approval. Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const pendingUsers = await User.find({ membershipStatus: "pending" }).select(
      "username email membershipRequestedAt"
    );
    return res.json(pendingUsers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/admin/users/{userId}/approve:
 *   patch:
 *     summary: Approve a pending user's membership
 *     description: Changes user role to 'member' and status to 'approved'. Sends approval email.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to approve
 *     responses:
 *       200:
 *         description: User approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User is not pending
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
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

    return res.json({ message: "User approved successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/admin/users/{userId}/reject:
 *   patch:
 *     summary: Reject a pending user's membership
 *     description: Sets membership status to 'rejected'. Sends rejection email.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to reject
 *     responses:
 *       200:
 *         description: User rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User is not pending
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
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

    return res.json({ message: "User rejected successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard overview metrics
 *     description: Provides key statistics for the platform. Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     members:
 *                       type: integer
 *                     admins:
 *                       type: integer
 *                 posts:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                 projects:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                 tags:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     system:
 *                       type: integer
 *                     user:
 *                       type: integer
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      pendingMembers,
      members,
      admins,
      totalPosts,
      totalProjects,
      totalTags,
      systemTags,
      userTags,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ membershipStatus: "pending" }),
      User.countDocuments({ role: "member" }),
      User.countDocuments({ role: "admin" }),
      Post.countDocuments(),
      Project.countDocuments(),
      Tag.countDocuments(),
      Tag.countDocuments({ type: "SYSTEM" }),
      Tag.countDocuments({ type: "USER" }),
    ]);

    return res.json({
      users: {
        total: totalUsers,
        pending: pendingMembers,
        members,
        admins,
      },
      posts: {
        total: totalPosts,
      },
      projects: {
        total: totalProjects,
      },
      tags: {
        total: totalTags,
        system: systemTags,
        user: userTags,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};