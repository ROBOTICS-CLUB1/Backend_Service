import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const isOwnerOrAdmin = (
  model: mongoose.Model<any>,
  authorField: string = "author"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params.id || req.params.commentId;
      if (!resourceId) {
        return res.status(400).json({ message: "Resource ID is required" });
      }

      const resource = await model.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      const authorId = resource[authorField]?.toString();
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      if (userRole === "admin" || authorId === userId) {
        (req as any).resource = resource; // Optional: attach for use in controller
        return next();
      }

      return res
        .status(403)
        .json({ message: "Not authorized to perform this action" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  };
};
