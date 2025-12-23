import { Request, Response } from "express";
import User from "../models/User";
import { uploadImage } from "../services/image.service";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management (authenticated user) and public profiles
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     description: Returns the current user's full profile data including username, email, bio, and profile picture.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - No valid token provided
 *       404:
 *         description: User not found (should not happen with valid token)
 *       500:
 *         description: Internal server error
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update the authenticated user's profile
 *     description: Allows updating non-sensitive fields like username, email, bio, and profile picture URL.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newusername"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *               bio:
 *                 type: string
 *                 example: "Full-stack developer passionate about open source"
 *               profilePicture:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: No valid fields provided for update
 *       409:
 *         description: Username or email already taken by another user
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { username, email, bio, profilePicture } = req.body;

    const updates: any = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (bio !== undefined) updates.bio = bio;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid updates provided" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: err.errors });
    }
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Username or email already taken" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/users/me/password:
 *   patch:
 *     summary: Change the authenticated user's password
 *     description: Securely changes the user's password. Requires the current password for verification.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - password
 *               - passwordConfirm
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: User's current password
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New desired password
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 description: Must match the new password exactly
 *             example:
 *               currentPassword: "oldPassword123"
 *               password: "newSecurePassword456!"
 *               passwordConfirm: "newSecurePassword456!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: |
 *           - Missing required fields
 *           - New passwords do not match
 *           - Current password is incorrect
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { currentPassword, password, passwordConfirm } = req.body;

    if (!currentPassword || !password || !passwordConfirm) {
      return res.status(400).json({
        message:
          "currentPassword, password, and passwordConfirm are all required",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password — pre-save middleware will hash it
    user.password = password;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Delete the authenticated user's account
 *     description: Permanently deletes the current user's account and all associated data. Admins are blocked from using this route.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Admin users cannot delete their account via this endpoint (use admin panel)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const deleteMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message:
          "Admin accounts cannot be deleted via this endpoint. Use the admin panel.",
      });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user's public profile by ID
 *     description: Returns public information about a user. Accessible to anyone (no auth required).
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: Public profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const getPublicProfileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "username role bio profilePicture createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/users/username/{username}:
 *   get:
 *     summary: Get a user's public profile by username
 *     description: Returns public information about a user using their username. Ideal for shareable links.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user (case-sensitive)
 *     responses:
 *       200:
 *         description: Public profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const getPublicProfileByUsername = async (
  req: Request,
  res: Response
) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select(
      "username role bio profilePicture createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/users/me/avatar:
 *   post:
 *     summary: Upload a new avatar for the authenticated user
 *     description: |
 *       Uploads an image (field name: "image") to Cloudinary in the "avatars" folder.
 *       Replaces any previous custom avatar and updates the user's profilePicture.
 *       Uses the same upload pipeline as posts/projects for consistency.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WebP, GIF) - max 5MB
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *       400:
 *         description: No file uploaded or invalid file type
 *       413:
 *         description: File too large
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Upload failed
 */
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const userId = (req as any).user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { url, public_id } = await uploadImage(req.file.buffer, "avatars");

    user.profilePicture = url;
    user.avatarPublicId = public_id;
    await user.save();

    return res.status(200).json({
      message: "Avatar uploaded successfully",
      profilePicture: url,
    });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
};

/**
 * @swagger
 * /api/users/me/avatar:
 *   delete:
 *     summary: Remove custom avatar and revert to default (DiceBear initials)
 *     description: Deletes the current custom avatar and falls back to the auto-generated DiceBear avatar based on username.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar removed, reverted to default
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                   description: New (default) avatar URL
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const removeAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.profilePicture = undefined;
    user.avatarPublicId = undefined;
    await user.save();

    return res.status(200).json({
      message: "Custom avatar removed, reverted to default",
      profilePicture: user.profilePicture, 
    });
  } catch (err) {
    console.error("Remove avatar error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
