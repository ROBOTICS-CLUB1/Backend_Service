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
 *     summary: Get all posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts with tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   author:
 *                     type: string
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         type:
 *                           type: string
 *                   mainTag:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find().populate("tags").populate("mainTag");
    return res.json(posts);
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
    const post = await Post.findById(id).populate("tags").populate("mainTag");
    if (!post) return res.status(404).json({ message: "Post not found" });
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
 *     summary: Create a new post
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
 *                 description: SYSTEM tag name
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tag names (SYSTEM or USER)
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid input or mainTag not SYSTEM
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

    let mainTag = await Tag.findOne({
      name: mainTagName.toLowerCase(),
      type: "SYSTEM",
    });
    if (!mainTag) {
      return res.status(400).json({ message: "mainTag must be a SYSTEM tag" });
    }

    if (!tags.some((t) => t.id === mainTag._id)) {
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
    await (await post.populate("tags")).populate("mainTag");

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
 *     summary: Update a post by ID
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
 *                 description: SYSTEM tag name
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tag names (SYSTEM or USER)
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
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (title) post.title = title;
    if (content) post.content = content;

    if (tagNames && Array.isArray(tagNames) && mainTagName) {
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

      let mainTag = await Tag.findOne({
        name: mainTagName.toLowerCase(),
        type: "SYSTEM",
      });
      if (!mainTag) {
        return res
          .status(400)
          .json({ message: "mainTag must be a SYSTEM tag" });
      }

      if (!tags.some((t) => t.id === mainTag._id)) {
        tags.push(mainTag);
      }

      post.tags = tags.map((t) => t._id);
      post.mainTag = mainTag._id;
    }

    await post.save();
    await (await post.populate("tags")).populate("mainTag");

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
 *     summary: Delete a post by ID
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
    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
