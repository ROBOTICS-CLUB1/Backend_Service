import { Request, Response } from "express";
import User from "../models/User";
import { signToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = new User({
      username,
      email,
      password,
      role,
    });

    await user.save();

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
    });

    return res.status(201).json({
      token,
    });
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

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
    });

    return res.json({ token });
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
};
