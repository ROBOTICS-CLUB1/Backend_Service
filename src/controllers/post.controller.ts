// src/controllers/postController.ts

import { Request, Response } from "express";
import Post from "../models/Post";
import Tag from "../models/Tag";
import { uploadImage } from "../services/image.service";

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Manage posts (CRUD operations with optional image upload)
 */

/**
 * @swagger
 * components:
 *   schemas:
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
 *         imageUrl:
 *           type: string
 *           nullable: true
 *           description: URL of the featured image (if uploaded)
 *         imagePublicId:
 *           type: string
 *           nullable: true
 *           description: Cloudinary public_id for future deletion/replacement
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with pagination, filtering, and searching
 *     description: Returns a paginated list of posts, sorted newest first. Supports filtering by tag and full-text search in title/content.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by exact tag name (case-insensitive). Returns empty list if tag doesn't exist.
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search text in title or content (case-insensitive regex)
 *     responses:
 *       200:
 *         description: Successful response with posts and pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Server error
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
      .populate({ path: "author", select: "username" });

    return res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
export const getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("tags")
      .populate("mainTag")
      .populate({ path: "author", select: "username" });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post (admin only)
 *     description: Creates a new blog post. Supports optional image upload via Cloudinary.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 description: Post title
 *               content:
 *                 type: string
 *                 description: Post content (Markdown/HTML supported)
 *               mainTag:
 *                 type: string
 *                 description: Name of an existing SYSTEM tag
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tag names. New USER tags are created automatically if they don't exist.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional featured image (uploaded to Cloudinary)
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing required fields or invalid mainTag
 *       500:
 *         description: Server error
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, tags: tagNames, mainTag: mainTagName } = req.body;
    const author = req.user!.id;

    if (
      !title ||
      !content ||
      !mainTagName ||
      !tagNames ||
      !Array.isArray(tagNames)
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const tags: any[] = [];
    for (const name of tagNames) {
      let tag = await Tag.findOne({ name: name.toLowerCase() });
      if (!tag) {
        tag = await Tag.create({
          name: name.toLowerCase(),
          type: "USER",
          createdBy: author,
        });
      }
      tags.push(tag);
    }

    const mainTag = await Tag.findOne({
      name: mainTagName.toLowerCase(),
      type: "SYSTEM",
    });
    if (!mainTag) {
      return res
        .status(400)
        .json({ message: "mainTag must be a valid SYSTEM tag" });
    }
    if (!tags.some((t) => t._id.toString() === mainTag._id.toString())) {
      tags.push(mainTag);
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;
    if (req.file?.buffer) {
      const result = await uploadImage(req.file.buffer);
      imageUrl = result.url;
      imagePublicId = result.public_id;
    }

    const post = new Post({
      title,
      content,
      author,
      tags: tags.map((t) => t._id),
      mainTag: mainTag._id,
      imageUrl,
      imagePublicId,
    });

    await post.save();
    await post.populate([
      "tags",
      "mainTag",
      { path: "author", select: "username" },
    ]);

    return res.status(201).json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post by ID (admin only - partial updates allowed)
 *     description: |
 *       Updates fields of an existing post. Text fields (title/content) can be updated independently.
 *       Tags can only be updated together (full replacement) by providing both `tags` and `mainTag`.
 *       Image can be replaced independently — new upload overwrites the previous one (old image remains on Cloudinary).
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New title (optional)
 *               content:
 *                 type: string
 *                 description: New content (optional)
 *               mainTag:
 *                 type: string
 *                 description: Required only when updating tags
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Full new list of tag names (required only when updating tags)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image to replace current one (optional)
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input (e.g., partial tag update)
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, tags: tagNames, mainTag: mainTagName } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;

    if (tagNames !== undefined || mainTagName !== undefined) {
      if (!Array.isArray(tagNames) || !mainTagName) {
        return res.status(400).json({
          message:
            "Both 'tags' (array) and 'mainTag' must be provided to update tags",
        });
      }

      const author = req.user!.id;
      const tags: any[] = [];

      for (const name of tagNames) {
        let tag = await Tag.findOne({ name: name.toLowerCase() });
        if (!tag) {
          tag = await Tag.create({
            name: name.toLowerCase(),
            type: "USER",
            createdBy: author,
          });
        }
        tags.push(tag);
      }

      const mainTag = await Tag.findOne({
        name: mainTagName.toLowerCase(),
        type: "SYSTEM",
      });
      if (!mainTag) {
        return res
          .status(400)
          .json({ message: "mainTag must be a valid SYSTEM tag" });
      }
      if (!tags.some((t) => t._id.toString() === mainTag._id.toString())) {
        tags.push(mainTag);
      }

      post.tags = tags.map((t) => t._id);
      post.mainTag = mainTag._id;
    }

    if (req.file?.buffer) {
      const result = await uploadImage(req.file.buffer);
      post.imageUrl = result.url;
      post.imagePublicId = result.public_id;
    }

    await post.save();
    await post.populate([
      "tags",
      "mainTag",
      { path: "author", select: "username" },
    ]);

    return res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post by ID (admin only)
 *     description: Permanently removes a post. Associated image remains on Cloudinary unless manually deleted.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post deleted successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
