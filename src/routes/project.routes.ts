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
  createPostValidator,
  updatePostValidator,
} from "../validators/post.validator";
import { getPostsQueryValidator } from "../validators/query.validator";
import { validate } from "../middleware/validate.middleware";
import { upload } from "../middleware/upload.middleware";
import commentRoutes from "../routes/comment.routes";
import { setParentModel } from "../middleware/parent.middleware";

const router = Router({ mergeParams: true });

// Public read-only routes
router.get("/", getPostsQueryValidator, validate, getProjects);
router.get("/:id", getProject);

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

router.use("/:id/comments", setParentModel("Project"), commentRoutes);

export default router;
