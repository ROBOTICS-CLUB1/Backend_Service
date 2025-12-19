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
    const pendingUsers = await User.find({
      membershipStatus: "pending",
    }).select("username email membershipRequestedAt");
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

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users in the system
 *     description: Returns a paginated list of all users with relevant details. Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of users per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (e.g., createdAt, username). Prefix with - for descending.
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const sort = (req.query.sort as string) || "-createdAt";

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select(
          "username email role membershipStatus membershipRequestedAt membershipReviewedAt createdAt updatedAt"
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(),
    ]);

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get a specific user by ID
 *     description: Returns detailed information about a single user. Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   patch:
 *     summary: Update a user's details
 *     description: Allows admin to update role, membership status, or other fields. Cannot update password here (use dedicated endpoint if needed).
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, member, admin]
 *               membershipStatus:
 *                 type: string
 *                 enum: [pending, approved, rejected, expired]
 *             example:
 *               role: "admin"
 *               membershipStatus: "approved"
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *         description: Invalid updates or no changes provided
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    if (updates.password) {
      return res
        .status(400)
        .json({ message: "Use dedicated password reset endpoint" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If membership status changed to approved/rejected, update reviewedAt
    if (
      updates.membershipStatus &&
      ["approved", "rejected"].includes(updates.membershipStatus)
    ) {
      user.membershipReviewedAt = new Date();
      await user.save();
    }

    return res.json({ message: "User updated successfully", user });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid data", errors: err.errors });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     description: Permanently removes a user from the system. Use with caution. Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete yourself or the last admin
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentAdminId = (req as any).user?.id;

    if (userId === currentAdminId) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last admin account" });
      }
    }

    await User.findByIdAndDelete(userId);

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
