import { body } from "express-validator";

export const createPostValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),
  body("mainTag")
    .trim()
    .notEmpty()
    .withMessage("Main tag is required")
    .isString()
    .withMessage("Main tag must be a string"),
  body("tags")
    .isArray({ min: 1 })
    .withMessage("Tags must be an array with at least one tag"),
  body("tags.*").isString().withMessage("Each tag must be a string"),
];

export const updatePostValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters"),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),
  body("mainTag")
    .optional()
    .trim()
    .isString()
    .withMessage("Main tag must be a string"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*").optional().isString().withMessage("Each tag must be a string"),
];
