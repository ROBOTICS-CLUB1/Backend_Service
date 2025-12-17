import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";



const PORT: number = parseInt(process.env.PORT || "5000");

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} at http://localhost:${PORT}`);
  });
};

startServer();
