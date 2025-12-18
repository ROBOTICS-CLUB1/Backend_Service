import { Request, Response } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";

/**
 * Add a comment to a post
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const author = req.user!.id;

    if (!content || content.trim() === "")
      return res.status(400).json({ message: "Content cannot be empty" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      post: postId,
      author,
      content: content.trim(),
    });

    return res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all comments for a post
 */
export const getComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comments = await Comment.find({ post: postId })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    return res.json(comments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
