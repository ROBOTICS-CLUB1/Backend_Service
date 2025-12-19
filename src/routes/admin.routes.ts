import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getDashboard,
  getAllUsers
} from "../controllers/admin.controller";

const router = Router();

// All routes are admin-protected: require authentication + admin role
router.use(authMiddleware);
router.use(requireRoles("admin"));

// user management
router.get("/users/", getAllUsers);
router.get("/users/pending", getPendingUsers);
router.patch("/users/:userId/approve", approveUser);
router.patch("/users/:userId/reject", rejectUser);

// Dashboard metrics
router.get("/dashboard", getDashboard);

export default router;
