# Robotics Club Backend API Reference

This document provides a detailed reference of all backend API endpoints for the Robotics Club backend.

---
## Authentication & Membership Onboarding

### Register
- **Endpoint:** `POST /api/auth/register`
- **Description:** Register a new user (membership request)
- **Request body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "StrongPassword123"
  }
```

**Response:**

  * `201 Created` with JWT token
  * Role: `user`, membershipStatus: `pending`
  * Membership pending admin approval (valid for 1 day)

### Login

* **Endpoint:** `POST /api/auth/login`
* **Description:** Login a registered user
* **Request body:**

  ```json
  {
    "email": "john@example.com",
    "password": "StrongPassword123"
  }
  ```
* **Response:** JWT token with `role` and `membershipStatus`

### Admin Membership Management

#### Get Pending Users

* **Endpoint:** `GET /api/admin/users/pending`
* **Description:** Retrieve all users pending membership approval
* **Response:** Array of User objects with `username`, `email`, `role`, `membershipStatus`, `membershipRequestedAt`

#### Approve User

* **Endpoint:** `PATCH /api/admin/users/{userId}/approve`
* **Description:** Approve a pending user's membership
* **Response:** Updated User object

  * Role updated to `member`
  * MembershipStatus updated to `approved`

#### Reject User

* **Endpoint:** `PATCH /api/admin/users/{userId}/reject`
* **Description:** Reject a pending user's membership
* **Response:** Updated User object

  * MembershipStatus updated to `rejected`

```


```

## **Posts Endpoints**

> **Note:** All post endpoints require authentication. Admin role is required for creating, updating, and deleting posts.

### **Get all posts**

* **URL:** `/api/posts`
* **Method:** GET
* **Auth required:** Yes
* **Response:**

```json
[
  {
    "_id": "string",
    "title": "string",
    "content": "string",
    "author": "string",
    "createdAt": "ISODate",
    "updatedAt": "ISODate"
  }
]
```

---

### **Get single post**

* **URL:** `/api/posts/:id`
* **Method:** GET
* **Auth required:** Yes
* **Params:**

  * `id` (string) – Post ID
* **Responses:**

  * `200 OK` → post object
  * `404 Not Found` → `{ "message": "Post not found" }`

---

### **Create a post**

* **URL:** `/api/posts`
* **Method:** POST
* **Auth required:** Yes, admin only
* **Body:**

```json
{
  "title": "string",
  "content": "string"
}
```

* **Responses:**

  * `201 Created` → created post object
  * `403 Forbidden` → `{ "message": "Admin access required" }`

---

### **Update a post**

* **URL:** `/api/posts/:id`
* **Method:** PUT
* **Auth required:** Yes, admin only
* **Params:**

  * `id` (string) – Post ID
* **Body:**

```json
{
  "title": "string",
  "content": "string"
}
```

* **Responses:**

  * `200 OK` → updated post object
  * `403 Forbidden` → `{ "message": "Admin access required" }`
  * `404 Not Found` → `{ "message": "Post not found" }`

---

### **Delete a post**

* **URL:** `/api/posts/:id`
* **Method:** DELETE
* **Auth required:** Yes, admin only
* **Params:**

  * `id` (string) – Post ID
* **Responses:**

  * `200 OK` → `{ "message": "Post deleted successfully" }`
  * `403 Forbidden` → `{ "message": "Admin access required" }`
  * `404 Not Found` → `{ "message": "Post not found" }`

---

## **Error Handling**

* All endpoints return appropriate HTTP status codes:

  * `400` → Bad Request
  * `401` → Unauthorized (missing or invalid token)
  * `403` → Forbidden (insufficient role)
  * `404` → Not Found
  * `500` → Server Error

```
 Made by Robotics Club Dev Team
```
---
