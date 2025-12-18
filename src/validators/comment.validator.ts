import { body } from "express-validator";

export const commentValidator = [
  body("content")
    .exists({ checkFalsy: true })
    .withMessage("Content is required")
    .isLength({ max: 500 })
    .withMessage("Content must be 500 characters or less"),
];
