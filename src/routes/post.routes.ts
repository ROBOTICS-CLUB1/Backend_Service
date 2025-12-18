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

const router = Router({ mergeParams: true });

//public read-only routes
router.get("/", getPostsQueryValidator, validate, getPosts);
router.get("/:id", getPost);

//protected routes for posts management by admin only
router.use(authMiddleware);

//create post
router.post(
  "/",
  requireRoles("admin"),
  createPostValidator,
  validate,
  createPost
);

//update post
router.put(
  "/:id",
  requireRoles("admin"),
  updatePostValidator,
  validate,
  updatePost
);

//delete post
router.delete("/:id", requireRoles("admin"), deletePost);

router.use("/:postId/comments", commentRoutes);
export default router;
