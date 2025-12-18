import { body, param } from "express-validator";

export const createPostValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),

  body("content").trim().notEmpty().withMessage("Content is required"),
];

export const updatePostValidator = [
  param("id").isMongoId().withMessage("Invalid post ID"),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),

  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),
];
