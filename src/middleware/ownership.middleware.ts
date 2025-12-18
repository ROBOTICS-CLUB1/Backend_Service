// src/middleware/ownership.middleware.ts

import { Request, Response, NextFunction } from "express";
import Project from "../models/Project";

export const isOwnerOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user!.role === "admin" || project.author.toString() === req.user!.id) {
      return next();
    }

    return res.status(403).json({ message: "Not authorized for this action" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};