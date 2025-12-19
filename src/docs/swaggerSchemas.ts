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
 *           description: MongoDB ObjectId as string
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Tag name (lowercase, trimmed)
 *           example: "javascript"
 *         type:
 *           type: string
 *           enum: [SYSTEM, USER]
 *           description: Type of tag
 *         createdBy:
 *           type: string
 *           description: User ID who created it (only for USER tags)
 *           example: "507f1f77bcf86cd799439011"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *         - tags
 *         - mainTag
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         author:
 *           type: string
 *           description: User ObjectId
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Tag ObjectIds (mainTag must be included)
 *         mainTag:
 *           type: string
 *           description: Must be a SYSTEM tag ObjectId (included in tags)
 *         imageUrl:
 *           type: string
 *         imagePublicId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Project:
 *       allOf:
 *         - $ref: '#/components/schemas/Post'   # Reuses everything from Post (identical structure)
 *       # If there are any tiny differences later, override them here
 */

export {}; // Makes it a module so TypeScript doesn't complain