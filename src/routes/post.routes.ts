import { Router } from "express";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/post.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getPosts);

router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
