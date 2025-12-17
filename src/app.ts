import express, { Application, Request, Response } from "express";
import errorHandler from "./middleware/error.middleware";

const app: Application = express();

// Middleware
app.use(express.json());

// Health check
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Robotics Club API", status: "OK" });
});


// Error handler (last middleware)
app.use(errorHandler);

export default app;
