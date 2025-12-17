# Robotics Club Backend API Reference

This document provides a detailed reference of all backend API endpoints for the Robotics Club backend.

---

## **Authentication Endpoints**

### **Register a new user**

- **URL:** `/api/auth/register`
- **Method:** POST
- **Auth required:** No
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user | admin"
}
````

* **Responses:**

  * `201 Created`

    ```json
    { "message": "User registered successfully" }
    ```
  * `400 Bad Request`

    ```json
    { "message": "Email already in use" }
    ```

---

### **Login user**

* **URL:** `/api/auth/login`
* **Method:** POST
* **Auth required:** No
* **Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

* **Responses:**

  * `200 OK`

    ```json
    { "token": "JWT_TOKEN" }
    ```
  * `400 Bad Request`

    ```json
    { "message": "Invalid credentials" }
    ```

---

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

---
