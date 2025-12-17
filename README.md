## Robotics Club Platform Backend

The Robotics Club Backend exposes a RESTful API built with TypeScript, Express, and MongoDB. It is designed to support user management, role-based access control, and content management for posts.

### Key Features

- **User Authentication**

  - Registration (`POST /api/auth/register`)
  - Login with JWT (`POST /api/auth/login`)
  - Role-based access: `user` or `admin`

- **Posts Management**

  - **Get all posts:** `GET /api/posts` (any logged-in user)
  - **Get single post:** `GET /api/posts/:id` (any logged-in user)
  - **Create post:** `POST /api/posts` (admin only)
  - **Update post:** `PUT /api/posts/:id` (admin only)
  - **Delete post:** `DELETE /api/posts/:id` (admin only)

- **Security**

  - JWT-based authentication
  - Admin role verification for sensitive operations

- **Error Handling**

  - Global error middleware
  - Proper HTTP status codes for invalid requests or unauthorized access

- **Future-ready**
  - Easily extendable for pagination, search, logging, and additional resources
  - Ready for Swagger documentation at `/api/docs`

Made by the Robotics Club Dev Team```