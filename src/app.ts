import express, { Application, Request, Response } from "express";
import errorHandler from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import adminRoutes from "./routes/admin.routes";
import { setupSwagger } from "./config/swagger";

const app: Application = express();

// Middleware
app.use(express.json());

// Health check
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Robotics Club API", status: "OK" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);

// Swagger documentation
setupSwagger(app);

// Global error handler (last middleware)
app.use(errorHandler);

export default app;
