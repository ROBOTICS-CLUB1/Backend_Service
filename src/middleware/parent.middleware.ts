import { Request, Response, NextFunction } from "express";

export const setParentModel = (model: "Post" | "Project") => {
  return (req: Request, _: Response, next: NextFunction) => {
    (req as any).parentModel = model;
    next();
  };
};