import { body } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const commentValidator = [
  body("content")
    .exists({ checkFalsy: true })
    .withMessage("Content is required")
    .isLength({ max: 500 })
    .withMessage("Content must be 500 characters or less"),
];


export const validateParentType = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { parentType } = req.params;
  if (!["posts", "projects"].includes(parentType)) {
    return res.status(400).json({ message: "Invalid parent type" });
  }
  next();
};