import { query } from "express-validator";

export const getPostsQueryValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100"),

  query("tag")
    .optional()
    .isString()
    .withMessage("tag must be a string")
    .trim()
    .notEmpty()
    .withMessage("tag cannot be empty"),

  query("q")
    .optional()
    .isString()
    .withMessage("q must be a string")
    .trim()
    .notEmpty()
    .withMessage("q cannot be empty"),
];
