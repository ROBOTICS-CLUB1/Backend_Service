# Robotics Club Backend API Reference

This document provides a detailed reference for all endpoints in the Robotics Club backend API.

Current as of: December 2025

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

````

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

All posts endpoints are under `/api/posts` and require a valid JWT token.

**Admin-only operations:** Create, Update, Delete (requires `admin` role).

### Get All Posts

- **Endpoint:** `GET /api/posts`
- **Description:** Retrieves all published posts (newest first).
- **Authentication Required:** Yes
- **Success Response:** `200 OK`
  ```json
  [
    {
      "_id": "string",
      "title": "string",
      "content": "string",
      "author": {
        "_id": "string",
        "username": "string"
      },
      "createdAt": "ISODate",
      "updatedAt": "ISODate"
    }
  ]
  ```

### Get Single Post

- **Endpoint:** `GET /api/posts/{id}`
- **Description:** Retrieves a specific post by ID.
- **Path Parameters:** `id` (string) – Post ID
- **Authentication Required:** Yes
- **Success Response:** `200 OK` – Post object (same structure as above)
- **Error Responses:**
  - `404 Not Found` → `{ "message": "Post not found" }`

### Create Post

- **Endpoint:** `POST /api/posts`
- **Description:** Creates a new post (admin only).
- **Authentication Required:** Yes (admin role)
- **Request Body:**
  ```json
  {
    "title": "string",
    "content": "string"
  }
  ```
- **Success Response:** `201 Created` – Created post object
- **Error Responses:**
  - `403 Forbidden` → `{ "message": "Admin access required" }`

### Update Post

- **Endpoint:** `PUT /api/posts/{id}`
- **Description:** Fully updates an existing post (admin only).
- **Path Parameters:** `id` (string) – Post ID
- **Authentication Required:** Yes (admin role)
- **Request Body:**
  ```json
  {
    "title": "string",
    "content": "string"
  }
  ```
- **Success Response:** `200 OK` – Updated post object
- **Error Responses:**
  - `403 Forbidden` → `{ "message": "Admin access required" }`
  - `404 Not Found` → `{ "message": "Post not found" }`

### Delete Post

- **Endpoint:** `DELETE /api/posts/{id}`
- **Description:** Deletes a post (admin only).
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
````
