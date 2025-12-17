import { Request, Response, NextFunction } from "express";

interface ErrorWithStatus extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
