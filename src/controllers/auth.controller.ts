import { Request, Response } from "express";
import User from "../models/User";
import { signToken } from "../utils/jwt";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and membership onboarding
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (membership request)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *     responses:
 *       201:
 *         description: Registration successful, membership pending approval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64f9c2e8b2a1c9a1d1234567
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     role:
 *                       type: string
 *                       example: user
 *                     membershipStatus:
 *                       type: string
 *                       example: pending
 *       400:
 *         description: Email already in use
 *       500:
 *         description: Server error
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = new User({
      username,
      email,
      password,
      role: "user",
      membershipStatus: "pending",
    });

    await user.save();

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      membershipStatus: user.membershipStatus,
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        membershipStatus: user.membershipStatus,
      },
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a registered user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64f9c2e8b2a1c9a1d1234567
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     role:
 *                       type: string
 *                       example: admin
 *                     membershipStatus:
 *                       type: string
 *                       example: approved
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      membershipStatus: user.membershipStatus,
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        membershipStatus: user.membershipStatus,
      },
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
