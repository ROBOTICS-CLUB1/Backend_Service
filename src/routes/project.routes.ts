import { Router } from "express";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
  removeProjectImage,
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
import Project from "../models/Project";

const router = Router({ mergeParams: true });

// Public read-only routes
router.get("/", getPostsQueryValidator, validate, getProjects);
router.get("/:id", getProject);

// Protected routes: member or admin
router.use(authMiddleware, requireRoles("member", "admin"));

// Create project
router.post("/", upload, createPostValidator, validate, createProject);

// Update project
router.put(
  "/:id",
  isOwnerOrAdmin(Project),
  upload,
  updatePostValidator,
  validate,
  updateProject
);

// Delete project
router.delete("/:id", isOwnerOrAdmin(Project), deleteProject);

//add project image
router.post("/:id/image", upload, uploadProjectImage);

// remove project image
router.delete("/:id/image", removeProjectImage);

export default router;
