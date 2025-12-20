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
 *         description: Type of parent resource (posts or projects)
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
 *                 maxLength: 500
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
    const author = req.user!.id;                    
    const parentModel = req.parentModel;           

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
    const parentModel = req.parentModel;

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

/**
 * @swagger
 * /{parentType}/{parentId}/comments/{commentId}:
 *   patch:
 *     summary: Update a comment (owner or admin only)
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
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Content is empty
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { content: content.trim() },
      { new: true }
    ).populate("author", "username");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    return res.json(comment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /{parentType}/{parentId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment (owner or admin only)
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
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    return res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};