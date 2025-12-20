import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller";
import { validate } from "../middleware/validate.middleware";
import { commentValidator } from "../validators/comment.validator";
import { isOwnerOrAdmin } from "../middleware/ownership.middleware";
import Comment from "../models/Comment";

const router = Router({ mergeParams: true });

// Public: get comments for a post
router.get("/", getComments);

// Protected: only members and admins can add comments
router.post(
  "/",
  authMiddleware,
  requireRoles("member", "admin"),
  commentValidator,
  validate,
  addComment
);

router.patch(
  "/:commentId",
  isOwnerOrAdmin(Comment),
  commentValidator,
  validate,
  updateComment
);

router.delete("/:commentId", isOwnerOrAdmin(Comment), deleteComment);

export default router;
