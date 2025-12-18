import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((err) => {
        if ("param" in err) {
          return {
            field: err.param,
            message: err.msg,
          };
        }

        return {
          field: "unknown",
          message: err.msg,
        };
      }),
    });
  }

  next();
};
