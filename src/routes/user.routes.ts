// routes/user.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getMe,
  updateMe,
  changePassword,
  deleteMe,
} from "../controllers/user.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Current authenticated user ("me") endpoints
router.get("/me", getMe);               
router.patch("/me", updateMe);
router.patch("/me/password", changePassword);
router.delete("/me", deleteMe);

export default router;