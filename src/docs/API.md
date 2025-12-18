# Robotics Club Backend API Reference

This document provides a detailed reference for all endpoints in the Robotics Club backend API.

**Current as of: December 18, 2025**

---

## Authentication & Membership Onboarding

All authentication endpoints are under `/api/auth`.

### Register (Membership Request)

- **Endpoint:** `POST /api/auth/register`
- **Description:** Creates a new user account and submits a membership request (pending admin approval).
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "token": "jwt-token-string",
    "user": {
      "username": "string",
      "email": "string",
      "role": "user",
      "membershipStatus": "pending",
      "membershipRequestedAt": "ISODate"
    }
  }
  ```
- **Notes:**
  - New users receive the role `user` and membership status `pending`.
  - Pending requests expire after 1 day if not approved.

### Login

- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates a registered user and returns a JWT token.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "token": "jwt-token-string",
    "user": {
      "username": "string",
      "email": "string",
      "role": "string",
      "membershipStatus": "string"
    }
  }
  ```

### Admin: Membership Management

Requires `admin` role. All endpoints under `/api/admin/users`.

#### Get Pending Membership Requests

- **Endpoint:** `GET /api/admin/users/pending`
- **Description:** Retrieves all users with `membershipStatus: pending`.
- **Success Response:** `200 OK`
  ```json
  [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "user",
      "membershipStatus": "pending",
      "membershipRequestedAt": "ISODate"
    }
  ]
  ```

#### Approve Membership

- **Endpoint:** `PATCH /api/admin/users/{userId}/approve`
- **Description:** Approves a pending membership request.
- **Path Parameters:** `userId` (string)
- **Success Response:** `200 OK` – Updated user object
  - `role` → `member`
  - `membershipStatus` → `approved`

#### Reject Membership

- **Endpoint:** `PATCH /api/admin/users/{userId}/reject`
- **Description:** Rejects a pending membership request.
- **Path Parameters:** `userId` (string)
- **Success Response:** `200 OK` – Updated user object
  - `membershipStatus` → `rejected`

---

## Posts Endpoints

All posts endpoints are under `/api/posts` and require a valid JWT token (any authenticated user can read).

**Admin-only operations:** Create, Update, Delete (require `admin` role).

### Get All Posts

- **Endpoint:** `GET /api/posts`
- **Description:** Retrieves a paginated list of posts, sorted newest first. Supports filtering and search.
- **Query Parameters:**
  - `page` (integer, default: 1) – Page number
  - `limit` (integer, default: 10, max: 100) – Posts per page
  - `tag` (string) – Filter by exact tag name (case-insensitive). Returns empty list if tag not found.
  - `q` (string) – Full-text search in title or content (case-insensitive)
- **Authentication Required:** Yes
- **Success Response:** `200 OK`
  ```json
  {
    "posts": [
      {
        "_id": "string",
        "title": "string",
        "content": "string",
        "author": {
          "_id": "string",
          "username": "string"
        },
        "tags": [
          /* populated Tag objects */
        ],
        "mainTag": {
          /* populated Tag object */
        },
        "imageUrl": "string | null",
        "imagePublicId": "string | null",
        "createdAt": "ISODate",
        "updatedAt": "ISODate"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "totalPages": 5
    }
  }
  ```

### Get Single Post

- **Endpoint:** `GET /api/posts/{id}`
- **Description:** Retrieves a specific post by ID.
- **Path Parameters:** `id` (string) – Post ID
- **Authentication Required:** Yes
- **Success Response:** `200 OK` – Full post object (same structure as in list, with populated tags, mainTag, and author)
- **Error Responses:**
  - `404 Not Found` → `{ "message": "Post not found" }`

### Create Post

- **Endpoint:** `POST /api/posts`
- **Description:** Creates a new post with optional featured image (admin only).
- **Authentication Required:** Yes (admin role)
- **Content-Type:** `multipart/form-data`
- **Request Body (Form Fields):**
  - `title` (string, required)
  - `content` (string, required)
  - `mainTag` (string, required) – Name of an existing SYSTEM tag
  - `tags` (array of strings, required) – Tag names (new USER tags created automatically)
  - `image` (file, optional) – Featured image uploaded to Cloudinary
- **Success Response:** `201 Created` – Created post object (fully populated)
- **Error Responses:**
  - `400 Bad Request` → Missing fields or invalid mainTag
  - `403 Forbidden` → `{ "message": "Admin access required" }`

### Update Post

- **Endpoint:** `PUT /api/posts/{id}`
- **Description:** Partially updates an existing post (admin only).
- **Path Parameters:** `id` (string) – Post ID
- **Authentication Required:** Yes (admin role)
- **Content-Type:** `multipart/form-data`
- **Request Body (Form Fields):**
  - `title` (string, optional)
  - `content` (string, optional)
  - `mainTag` + `tags` (both required together for tag updates – full replacement)
  - `image` (file, optional) – New image replaces the current one (old image remains on Cloudinary)
- **Success Response:** `200 OK` – Updated post object (fully populated)
- **Error Responses:**
  - `400 Bad Request` → Invalid input (e.g., partial tag update)
  - `403 Forbidden` → `{ "message": "Admin access required" }`
  - `404 Not Found` → `{ "message": "Post not found" }`

### Delete Post

- **Endpoint:** `DELETE /api/posts/{id}`
- **Description:** Permanently deletes a post (admin only). Associated image remains on Cloudinary.
- **Path Parameters:** `id` (string) – Post ID
- **Authentication Required:** Yes (admin role)
- **Success Response:** `200 OK`
  ```json
  { "message": "Post deleted successfully" }
  ```
- **Error Responses:**
  - `403 Forbidden` → `{ "message": "Admin access required" }`
  - `404 Not Found` → `{ "message": "Post not found" }`

---

## Global Error Handling

All endpoints use standard HTTP status codes and return JSON error responses where applicable:

| Status Code | Meaning               | Typical Response Body                       |
| ----------- | --------------------- | ------------------------------------------- |
| 400         | Bad Request           | `{ "message": "Validation error details" }` |
| 401         | Unauthorized          | `{ "message": "Invalid or missing token" }` |
| 403         | Forbidden             | `{ "message": "Admin access required" }`    |
| 404         | Not Found             | `{ "message": "Resource not found" }`       |
| 500         | Internal Server Error | `{ "message": "Something went wrong" }`     |

---

```
Made with ❤️ by the Robotics Club Dev Team
```
