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
import {validateParentType} from "../validators/comment.validator"
import Comment from "../models/Comment";

const router = Router({ mergeParams: true });

router.use(validateParentType);

// Public
router.get("/", getComments);

// Protected
router.use(authMiddleware);
router.post(
  "/",
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
