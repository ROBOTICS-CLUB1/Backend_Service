import multer from "multer";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(null, false);
    }
    cb(null, true);
  },
}).single("image"); 

export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }
    next();
  });
};
