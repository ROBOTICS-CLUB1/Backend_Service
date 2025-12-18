// src/routes/project.routes.ts

import { Router } from "express";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";
import { isOwnerOrAdmin } from "../middleware/ownership.middleware";
import {
  createPostValidator, // Reuse or create createProjectValidator if needed
  updatePostValidator, // Reuse or create updateProjectValidator
} from "../validators/post.validator"; // Adjust if separate validators needed
import { getPostsQueryValidator } from "../validators/query.validator";
import { validate } from "../middleware/validate.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router({ mergeParams: true });

// Public read-only routes (any authenticated user)
router.get("/", authMiddleware, getPostsQueryValidator, validate, getProjects);
router.get("/:id", authMiddleware, getProject);

// Protected routes
router.use(authMiddleware);

// Create project (member or admin)
router.post(
  "/",
  requireRoles("member", "admin"),
  upload,
  createPostValidator, // Reuse, or create specific
  validate,
  createProject
);

// Update project (owner or admin)
router.put(
  "/:id",
  requireRoles("member", "admin"),
  isOwnerOrAdmin,
  upload,
  updatePostValidator, // Reuse, or create specific
  validate,
  updateProject
);

// Delete project (owner or admin)
router.delete(
  "/:id",
  requireRoles("member", "admin"),
  isOwnerOrAdmin,
  deleteProject
);

export default router;