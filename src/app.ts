import express, { Application, Request, Response } from "express";
import errorHandler from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";

const app: Application = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Robotics Club API", status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use(errorHandler);

export default app;
