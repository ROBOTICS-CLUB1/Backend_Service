import { Request, Response } from "express";
import Post from "../models/Post";
import Tag from "../models/Tag";
import { uploadImage, deleteImage } from "../services/image.service";
import fs from "fs/promises";

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Blog posts management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f1a2b3c4d5e6f789012345"
 *         name:
 *           type: string
 *           example: "robotics"
 *         type:
 *           type: string
 *           enum: [SYSTEM, USER]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *         mainTag:
 *           $ref: '#/components/schemas/Tag'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const populateAuthor = { path: "author", select: "username _id" };

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of posts
 */
export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const tagName = (req.query.tag as string)?.trim();
    const searchQuery = (req.query.q as string)?.trim();

    const filter: any = {};

    if (tagName) {
      const tag = await Tag.findOne({ name: tagName.toLowerCase() });
      if (!tag) {
        return res.json({
          posts: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }
      filter.tags = tag._id;
    }

    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const total = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("tags")
      .populate("mainTag")
      .populate(populateAuthor);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Post not found
 */
export const getPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("tags")
      .populate("mainTag")
      .populate(populateAuthor);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a post (admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - mainTag
 *               - tags
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               mainTag:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    const author = req.user!.id;
    let { title, content, tags, mainTag } = req.body;

    if (!title || !content || !tags || !mainTag) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: "tags must be an array" });
    }

    const normalizedTagNames = [
      ...new Set(
        tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean)
      ),
    ];

    const resolvedTags = [];
    for (const name of normalizedTagNames) {
      let tag = await Tag.findOne({ name });
      if (!tag) {
        tag = await Tag.create({ name, type: "USER" });
      }
      resolvedTags.push(tag);
    }

    const mainTagDoc = await Tag.findOne({
      name: mainTag.toLowerCase(),
      type: "SYSTEM",
    });

    if (!mainTagDoc) {
      return res
        .status(400)
        .json({ message: "mainTag must be a valid SYSTEM tag" });
    }

    if (!resolvedTags.some((t) => t._id.equals(mainTagDoc._id))) {
      resolvedTags.push(mainTagDoc);
    }

    const post = await Post.create({
      title,
      content,
      author,
      tags: resolvedTags.map((t) => t._id),
      mainTag: mainTagDoc._id,
    });

    await post.populate(["tags", "mainTag", populateAuthor]);
    res.status(201).json(post);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post (admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               mainTag:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Post updated
 */
export const updatePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { title, content, tags, mainTag } = req.body;

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;

    if (tags !== undefined || mainTag !== undefined) {
      if (!Array.isArray(tags) || !mainTag) {
        return res.status(400).json({
          message: "Both tags and mainTag are required when updating tags",
        });
      }

      const normalizedTagNames = [
        ...new Set(
          tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean)
        ),
      ];

      const resolvedTags = [];
      for (const name of normalizedTagNames) {
        let tag = await Tag.findOne({ name });
        if (!tag) {
          tag = await Tag.create({ name, type: "USER" });
        }
        resolvedTags.push(tag);
      }

      const mainTagDoc = await Tag.findOne({
        name: mainTag.toLowerCase(),
        type: "SYSTEM",
      });

      if (!mainTagDoc) {
        return res
          .status(400)
          .json({ message: "mainTag must be a valid SYSTEM tag" });
      }

      if (!resolvedTags.some((t) => t._id.equals(mainTagDoc._id))) {
        resolvedTags.push(mainTagDoc);
      }

      post.tags = resolvedTags.map((t) => t._id);
      post.mainTag = mainTagDoc._id;
    }

    await post.save();
    await post.populate(["tags", "mainTag", populateAuthor]);
    res.json(post);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post (admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 */
export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/posts/{id}/image:
 *   post:
 *     summary: Upload an image for a post (admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid input or missing image
 *       404:
 *         description: Post not found
 */
export const uploadPostImage = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    if (post.imagePublicId) {
      await deleteImage(post.imagePublicId);
    }

    const fileBuffer = await fs.readFile(req.file.path);
    const result = await uploadImage(fileBuffer, `posts/${post._id}`);
    post.imageUrl = result.url;
    post.imagePublicId = result.public_id;

    await post.save();
    await fs.unlink(req.file.path);

    res.json({ message: "Image uploaded successfully", post });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/posts/{id}/image:
 *   delete:
 *     summary: Remove a post's image (admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image removed successfully
 *       404:
 *         description: Post not found or no image to remove
 */
export const removePostImage = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.imagePublicId) {
      return res.status(404).json({ message: "No image to remove" });
    }

    await deleteImage(post.imagePublicId);
    post.imageUrl = undefined;
    post.imagePublicId = undefined;

    await post.save();
    res.json({ message: "Image removed successfully", post });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
