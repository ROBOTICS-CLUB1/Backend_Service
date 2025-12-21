import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getMe,
  updateMe,
  changePassword,
  deleteMe,
  getPublicProfileById,
  getPublicProfileByUsername,
  uploadAvatar,
  removeAvatar,
} from "../controllers/user.controller";

import { uploadMiddleware } from "../middleware/upload.middleware";

const router = Router();
//public profile routes:
router.get("/:id", getPublicProfileById);
router.get("/username/:username", getPublicProfileByUsername);

// Protected routes (require user authentication)
router.use(authMiddleware);

// Current authenticated user ("me") endpoints
router.get("/me", getMe);
router.patch("/me", updateMe);
router.patch("/me/password", changePassword);
router.delete("/me", deleteMe);

//Avatar upload and removal
router.post("/me/avatar", uploadMiddleware, uploadAvatar);
router.delete("/me/avatar", removeAvatar);
export default router;
