## Robotics Club Platform Backend

The Robotics Club Backend exposes a RESTful API built with TypeScript, Express, and MongoDB. It is designed to support user management, role-based access control, and content management for posts.

### Key Features

- **User Authentication & Membership Onboarding**

  - **Registration (`POST /api/auth/register`)**

    - Users register and are set to **pending membership**.
    - Default role: `user`.
    - Membership is valid for 1 day pending admin approval.
    - Returns a JWT token including `role` and `membershipStatus`.

  - **Login with JWT (`POST /api/auth/login`)**

    - Login a registered user.
    - Returns a JWT token including `role` and `membershipStatus`.

  - **Admin Membership Management**

    - **Get pending users:** `GET /api/admin/users/pending`
    - **Approve user:** `PATCH /api/admin/users/{userId}/approve`
    - **Reject user:** `PATCH /api/admin/users/{userId}/reject`

  - **Roles and Permissions**
    - `user` → default registered user, limited access
    - `member` → approved club member, full access to member features
    - `admin` → club leaders with full access and approval permissions

- **Posts Management**

  - **Get all posts:** `GET /api/posts` (any logged-in user)  
    Supports pagination (`?page=1&limit=10`), tag filtering (`?tag=robotics`), and text search (`?q=keyword`). Posts are sorted newest first.

  - **Get single post:** `GET /api/posts/:id` (any logged-in user)

  - **Create post:** `POST /api/posts` (admin only)  
    Multipart/form-data request. Required fields: `title`, `content`, `mainTag` (SYSTEM tag name), `tags` (array of tag names). Optional: `image` (featured image uploaded to Cloudinary).

  - **Update post:** `PUT /api/posts/:id` (admin only)  
    Multipart/form-data request. Partial updates allowed:  
    - `title` and `content` can be updated independently  
    - `tags` and `mainTag` must both be provided for tag changes (full replacement)  
    - `image` can be uploaded to replace the current featured image

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

```
 Made by the Robotics Club Dev Team
```
