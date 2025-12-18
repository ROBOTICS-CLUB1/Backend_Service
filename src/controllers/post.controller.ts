import { Request, Response } from "express";
import Post from "../models/Post";
import Tag from "../models/Tag";

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Manage posts (CRUD)
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with pagination, filtering, and searching
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter posts by tag name (exact match, case-insensitive)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text search in post title or content (case-insensitive)
 *     responses:
 *       200:
 *         description: List of posts with pagination info. Posts are sorted newest first.
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
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10)); // sensible limits
    const skip = (page - 1) * limit;

    const tagName = (req.query.tag as string)?.trim();
    const searchQuery = (req.query.q as string)?.trim();

    const filter: any = {};

    // Filter by tag
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

    // Text search
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const total = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .populate("tags")
      .populate("mainTag")
      .populate({ path: "author", select: "username" }); // show author username

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
 *         schema:
 *           type: string
 *         required: true
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
 *                 description: Name of a SYSTEM tag
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tag names (SYSTEM or USER - new USER tags will be created)
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Missing fields or invalid mainTag
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

    // Resolve or create tags
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

    // Validate mainTag is SYSTEM
    const mainTag = await Tag.findOne({
      name: mainTagName.toLowerCase(),
      type: "SYSTEM",
    });
    if (!mainTag) {
      return res
        .status(400)
        .json({ message: "mainTag must be a valid SYSTEM tag" });
    }

    // Ensure mainTag is included in tags
    if (!tags.some((t) => t._id.toString() === mainTag._id.toString())) {
      tags.push(mainTag);
    }

    const post = new Post({
      title,
      content,
      author,
      tags: tags.map((t) => t._id),
      mainTag: mainTag._id,
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
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
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
 *                 description: Name of a SYSTEM tag (only if updating tags)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: New full array of tag names (only if updating tags)
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Invalid input or mainTag not SYSTEM
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

    // Update simple fields if provided
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;

    // Update tags only if both tags and mainTag are provided (full replacement)
    if (tagNames !== undefined || mainTagName !== undefined) {
      if (!Array.isArray(tagNames) || !mainTagName) {
        return res.status(400).json({
          message:
            "To update tags, both 'tags' array and 'mainTag' must be provided",
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
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
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
