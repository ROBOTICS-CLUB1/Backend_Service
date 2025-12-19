## Robotics Club Platform Backend

---

The Robotics Club Backend exposes a RESTful API built with TypeScript, Express, and MongoDB. It powers a community platform where members can showcase robotics projects, share knowledge through blog posts, and engage with tagged content.

### Key Features

- **User Authentication & Membership Onboarding**

  - **Registration (`POST /api/auth/register`)**  
    Users sign up and submit a membership request (set to **pending**).  
    Default role: `user`. Admins must approve to grant full access.
  - **Login (`POST /api/auth/login`)**  
    Returns JWT token with `role` and `membershipStatus`.
  - **Admin Membership Management**
    - List pending requests: `GET /api/admin/users/pending`
    - Approve: `PATCH /api/admin/users/{userId}/approve` → role becomes `member`
    - Reject: `PATCH /api/admin/users/{userId}/reject`  
      → Sends beautifully formatted approval/rejection emails via Maileroo.

- **Roles and Permissions**

  - `user` → registered, limited access (can view content)
  - `member` → approved club member → can create/update/delete **their own** projects
  - `admin` → full access + membership approval + manage all posts/projects

- **Blog Posts Management (Admin-only Content)**

  - Public read access for all authenticated users
  - Full CRUD operations restricted to admins
  - Supports featured images (Cloudinary), rich tagging system

- **Projects Showcase (Member Content)**

  - Public read access for all authenticated users
  - Members can create, update, and delete **their own** projects
  - Admins have full access to all projects
  - Same rich tagging and image support as posts

- **Tagging System**

  - Two tag types: `SYSTEM` (predefined, used for mainTag) and `USER` (dynamically created)
  - Tags enable powerful filtering and discovery across both posts and projects
  - `mainTag` must always be a SYSTEM tag and included in the tags array

- **Additional Features**

  - Pagination, tag filtering, and full-text search on list endpoints
  - JWT-based authentication with role middleware
  - Swagger/OpenAPI documentation at `/api-docs`
  - Transactional emails for membership lifecycle
  - Image uploads via Cloudinary
  - Comprehensive error handling and logging

- **Tech Stack**
  - Node.js + Express + TypeScript
  - MongoDB + Mongoose
  - JWT authentication
  - Nodemailer + Maileroo (SMTP on port 2525)
  - Cloudinary for image management
  - Swagger UI for API exploration

```

Made with ❤️ by the Robotics Club Dev Team

```
