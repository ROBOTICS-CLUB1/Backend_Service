import { body } from "express-validator";

export const createPostValidator = [
  body("title")
    .exists({ checkFalsy: true })
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters"),

  body("content")
    .exists({ checkFalsy: true })
    .withMessage("Content is required")
    .isString()
    .withMessage("Content must be a string")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),

  body("mainTag")
    .exists({ checkFalsy: true })
    .withMessage("mainTag is required")
    .isString()
    .withMessage("mainTag must be a string")
    .trim(),

  body("tags")
    .exists({ checkFalsy: true })
    .withMessage("tags is required")
    .isArray({ min: 1 })
    .withMessage("tags must be a non-empty array"),

  body("tags.*")
    .isString()
    .withMessage("Each tag must be a string")
    .trim()
    .notEmpty()
    .withMessage("Tag names cannot be empty"),
];

export const updatePostValidator = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters"),

  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),

  body("mainTag")
    .optional()
    .isString()
    .withMessage("mainTag must be a string")
    .trim(),

  body("tags")
    .optional()
    .isArray({ min: 1 })
    .withMessage("tags must be a non-empty array"),

  body("tags.*")
    .optional()
    .isString()
    .withMessage("Each tag must be a string")
    .trim()
    .notEmpty()
    .withMessage("Tag names cannot be empty"),
];
