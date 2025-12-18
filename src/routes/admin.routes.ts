import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
} from "../controllers/admin.controller";

const router = Router();
//All routes are admin protected so only available to system admins
router.use(authMiddleware);
router.use(requireRoles("admin"));

// Get all pending users
router.get("/users/pending", getPendingUsers);

// Approve user
router.patch("/users/:userId/approve", approveUser);

// Reject user
router.patch("/users/:userId/reject", rejectUser);

export default router;
