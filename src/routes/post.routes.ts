import { Router } from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  uploadPostImage,
  removePostImage,
} from "../controllers/post.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";
import {
  createPostValidator,
  updatePostValidator,
} from "../validators/post.validator";
import { getPostsQueryValidator } from "../validators/query.validator";
import { validate } from "../middleware/validate.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router({ mergeParams: true });

// public read-only routes
router.get("/", getPostsQueryValidator, validate, getPosts);
router.get("/:id", getPost);

// protected routes for posts management by admin only
router.use(authMiddleware);
router.use(requireRoles("admin"));

// create post
router.post("/", createPostValidator, validate, createPost);

// update post
router.put("/:id", updatePostValidator, validate, updatePost);

// delete post
router.delete("/:id", deletePost);

// upload post image
router.post("/:id/image", upload, uploadPostImage);

// remove post image
router.delete("/:id/image", removePostImage);

export default router;
