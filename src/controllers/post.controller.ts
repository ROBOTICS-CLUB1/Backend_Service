import { Request, Response } from "express";
import Post from "../models/Post";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find();
    return res.json(posts);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;

    const author = (req.user as { id: string; role: "user" | "admin" }).id;

    const post = new Post({ title, content, author });
    await post.save();

    return res.status(201).json(post);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const post = await Post.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json(post);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json({ message: "Post deleted successfully" });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
