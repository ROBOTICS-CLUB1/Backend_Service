import { Request, Response } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import Project from "../models/Project";

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Manage comments on posts and projects
 */

/**
 * @swagger
 * /{parentType}/{parentId}/comments:
 *   post:
 *     summary: Add a comment to a post or project
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [posts, projects]
 *         description: Type of parent resource
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post or project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Content is empty
 *       404:
 *         description: Parent resource not found
 *       500:
 *         description: Server error
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;
    const { content } = req.body;
    const author = (req as any).user.id;
    const parentModel = req.parentModel as "Post" | "Project";

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    const Model = parentModel === "Post" ? Post : Project;
    const parent = await Model.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: `${parentModel} not found` });
    }

    const comment = await Comment.create({
      parent: parentId,
      parentModel,
      author,
      content: content.trim(),
    });

    await comment.populate("author", "username");

    return res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /{parentType}/{parentId}/comments:
 *   get:
 *     summary: Get all comments for a post or project
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: parentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [posts, projects]
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *       404:
 *         description: Parent resource not found
 *       500:
 *         description: Server error
 */
export const getComments = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;
    const parentModel = req.parentModel as "Post" | "Project";

    const Model = parentModel === "Post" ? Post : Project;
    const parent = await Model.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: `${parentModel} not found` });
    }

    const comments = await Comment.find({ parent: parentId, parentModel })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    return res.json(comments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};