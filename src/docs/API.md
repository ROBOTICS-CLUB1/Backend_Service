# Robotics Club Backend API Reference

This document provides a detailed reference for all endpoints in the Robotics Club backend API.

**Current as of: December 19, 2025**

---

## Authentication & Membership Onboarding

All authentication endpoints are under `/api/auth`.

### Register (Membership Request)

- **Endpoint:** `POST /api/auth/register`
- **Description:** Creates a new user and submits a membership request (pending admin approval).
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string (min 6 chars)"
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "token": "jwt-string"
  }
  ```
- **Notes:** New users get `role: "user"` and `membershipStatus: "pending"`.

### Login

- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates user and returns JWT.
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
    "token": "jwt-string"
  }
  ```

### Admin: Membership Management

Requires `admin` role. Endpoints under `/api/admin`.

#### Get Pending Requests

- **Endpoint:** `GET /api/admin/users/pending`
- **Success Response:** Array of pending users (with `username`, `email`, `membershipRequestedAt`)

#### Approve User

- **Endpoint:** `PATCH /api/admin/users/{userId}/approve`
- **Effect:** Sets `role: "member"`, `membershipStatus: "approved"`, sends welcome email.

#### Reject User

- **Endpoint:** `PATCH /api/admin/users/{userId}/reject`
- **Effect:** Sets `membershipStatus: "rejected"`, sends polite rejection email.

---

## Posts Endpoints (Blog – Admin Content)

Base: `/api/posts`  
**Read access:** Any authenticated user  
**Write access:** Admin only

### Get All Posts

- **Endpoint:** `GET /api/posts`
- **Query Params:** `page`, `limit` (max 100), `tag`, `q` (search)
- **Response:** Paginated list with populated `author`, `tags`, `mainTag`

### Get Single Post

- **Endpoint:** `GET /api/posts/{id}`

### Create Post

- **Endpoint:** `POST /api/posts` (multipart/form-data, admin only)
- **Fields:** `title`, `content`, `mainTag` (SYSTEM tag name), `tags` (array), `image` (optional file)

### Update Post

- **Endpoint:** `PUT /api/posts/{id}` (multipart/form-data, admin only)
- **Partial updates:** title/content/image independently; tags require both `tags` + `mainTag`

### Delete Post

- **Endpoint:** `DELETE /api/posts/{id}` (admin only)

---

## Projects Endpoints (Member Showcase)

Base: `/api/projects`  
**Read access:** Any authenticated user  
**Create/Update/Delete own projects:** Members & admins  
**Full access:** Admins only

### Get All Projects

- **Endpoint:** `GET /api/projects`
- **Query Params:** `page`, `limit` (max 100), `tag`, `q` (search)
- **Response:** Paginated list with populated `author`, `tags`, `mainTag`

### Get Single Project

- **Endpoint:** `GET /api/projects/{id}`

### Create Project

- **Endpoint:** `POST /api/projects` (multipart/form-data, member/admin)
- **Fields:** `title`, `content`, `mainTag` (SYSTEM tag name), `tags` (array), `image` (optional)
- **Notes:** Members can only create their own projects.

### Update Project

- **Endpoint:** `PUT /api/projects/{id}` (multipart/form-data)
- **Authorization:**
  - Owner (project.author === user.id) OR admin
- **Partial updates:** same rules as posts

### Delete Project

- **Endpoint:** `DELETE /api/projects/{id}`
- **Authorization:** Owner OR admin

---

## Admin Dashboard

- **Endpoint:** `GET /api/admin/dashboard`
- **Requires:** `admin` role
- **Response:**
  ```json
  {
    "users": { "total": 120, "pending": 8, "members": 85, "admins": 3 },
    "posts": { "total": 45 },
    "projects": { "total": 92 },
    "tags": { "total": 67, "system": 12, "user": 55 }
  }
  ```

---

## Global Error Handling

| Status | Meaning      | Example Body                               |
| ------ | ------------ | ------------------------------------------ |
| 400    | Bad Request  | `{ "message": "Missing required fields" }` |
| 401    | Unauthorized | `{ "message": "Invalid token" }`           |
| 403    | Forbidden    | `{ "message": "Admin access required" }`   |
| 404    | Not Found    | `{ "message": "Project not found" }`       |
| 500    | Server Error | `{ "message": "Server error" }`            |

---

## API Documentation

Interactive Swagger UI available at:  
**`/api-docs`** (or whatever path you configured)

```
Made with ❤️ by the Robotics Club Dev Team
```
