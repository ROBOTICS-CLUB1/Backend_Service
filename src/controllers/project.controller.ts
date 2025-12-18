import { Request, Response } from "express";
import Project from "../models/Project";
import Tag from "../models/Tag";
import { uploadImage } from "../services/image.service";

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Manage projects (CRUD operations with optional image upload)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
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
 * /api/projects:
 *   get:
 *     summary: Get all projects with pagination, filtering, and searching
 *     description: Returns a paginated list of projects, sorted newest first. Supports filtering by tag and full-text search in title/content.
 *     tags: [Projects]
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
 *         description: Number of projects per page
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
 *         description: Successful response with projects and pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
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
export const getProjects = async (req: Request, res: Response) => {
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
          projects: [],
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

    const total = await Project.countDocuments(filter);

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("tags")
      .populate("mainTag")
      .populate({ path: "author", select: "username" });

    return res.json({
      projects,
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
 * /api/projects/{id}:
 *   get:
 *     summary: Get a single project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("tags")
      .populate("mainTag")
      .populate({ path: "author", select: "username" });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project (member or admin only)
 *     description: Creates a new project. Supports optional image upload via Cloudinary.
 *     tags: [Projects]
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
 *                 description: Project title
 *               content:
 *                 type: string
 *                 description: Project content (Markdown/HTML supported)
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
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Missing required fields or invalid mainTag
 *       500:
 *         description: Server error
 */
export const createProject = async (req: Request, res: Response) => {
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

    const mainTagDoc = await Tag.findOne({
      name: mainTagName.toLowerCase(),
      type: "SYSTEM",
    });
    if (!mainTagDoc) {
      return res.status(400).json({ message: "mainTag must be a valid SYSTEM tag" });
    }
    if (!tags.some((t) => t._id.toString() === mainTagDoc._id.toString())) {
      tags.push(mainTagDoc);
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;
    if (req.file?.buffer) {
      const result = await uploadImage(req.file.buffer, "projects");
      imageUrl = result.url;
      imagePublicId = result.public_id;
    }

    const project = new Project({
      title,
      content,
      author,
      tags: tags.map((t) => t._id),
      mainTag: mainTagDoc._id,
      imageUrl,
      imagePublicId,
    });

    await project.save();
    await project.populate([
      "tags",
      "mainTag",
      { path: "author", select: "username" },
    ]);

    return res.status(201).json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project by ID (owner member or admin only - partial updates allowed)
 *     description: |
 *       Updates fields of an existing project. Text fields (title/content) can be updated independently.
 *       Tags can only be updated together (full replacement) by providing both `tags` and `mainTag`.
 *       Image can be replaced independently — new upload overwrites the previous one (old image remains on Cloudinary).
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
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
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input (e.g., partial tag update)
 *       403:
 *         description: Not authorized to update this project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, tags: tagNames, mainTag: mainTagName } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Ownership check (done in middleware, but here for completeness)
    if (req.user!.role !== "admin" && project.author.toString() !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    if (title !== undefined) project.title = title;
    if (content !== undefined) project.content = content;

    if (tagNames !== undefined || mainTagName !== undefined) {
      if (!Array.isArray(tagNames) || !mainTagName) {
        return res.status(400).json({
          message: "Both 'tags' (array) and 'mainTag' must be provided to update tags",
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

      const mainTagDoc = await Tag.findOne({
        name: mainTagName.toLowerCase(),
        type: "SYSTEM",
      });
      if (!mainTagDoc) {
        return res.status(400).json({ message: "mainTag must be a valid SYSTEM tag" });
      }
      if (!tags.some((t) => t._id.toString() === mainTagDoc._id.toString())) {
        tags.push(mainTagDoc);
      }

      project.tags = tags.map((t) => t._id);
      project.mainTag = mainTagDoc._id;
    }

    if (req.file?.buffer) {
      const result = await uploadImage(req.file.buffer, "projects");
      project.imageUrl = result.url;
      project.imagePublicId = result.public_id;
    }

    await project.save();
    await project.populate([
      "tags",
      "mainTag",
      { path: "author", select: "username" },
    ]);

    return res.json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project by ID (owner member or admin only)
 *     description: Permanently removes a project. Associated image remains on Cloudinary unless manually deleted.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project deleted successfully
 *       403:
 *         description: Not authorized to delete this project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Ownership check (done in middleware, but here for completeness)
    if (req.user!.role !== "admin" && project.author.toString() !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    await Project.findByIdAndDelete(id);

    return res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};