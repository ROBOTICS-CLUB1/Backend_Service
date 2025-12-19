import { Router } from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/post.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";
import {
  createPostValidator,
  updatePostValidator,
} from "../validators/post.validator";
import { getPostsQueryValidator } from "../validators/query.validator";
import { validate } from "../middleware/validate.middleware";
import commentRoutes from "../routes/comment.routes";
import { upload } from "../middleware/upload.middleware"; // <-- import your upload middleware
import { setParentModel } from "../middleware/parent.middleware";

const router = Router({ mergeParams: true });

// public read-only routes
router.get("/", getPostsQueryValidator, validate, getPosts);
router.get("/:id", getPost);

// protected routes for posts management by admin only
router.use(authMiddleware);

// create post (with image upload)
router.post(
  "/",
  requireRoles("admin"),
  upload,
  createPostValidator,
  validate,
  createPost
);

// update post (with optional image upload)
router.put(
  "/:id",
  requireRoles("admin"),
  upload,
  updatePostValidator,
  validate,
  updatePost
);

// delete post
router.delete("/:id", requireRoles("admin"), deletePost);

// comment routes
router.use("/:postId/comments", setParentModel("Post"), commentRoutes);

export default router;
