import { Router } from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/post.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/role.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getPosts);
router.get("/:id",getPost);

router.post("/", adminMiddleware, createPost);
router.put("/:id", adminMiddleware, updatePost);
router.delete("/:id", adminMiddleware, deletePost);

export default router;
