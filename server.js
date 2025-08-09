import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import { dbConnect } from "./src/config/dbConnect.js";
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

const app = express();

// middlewares
app.use(express.json());

// enable cors policy
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const PORT = 8000;

dbConnect()
  .then(() => {
    app.listen(PORT, (error) => {
      error
        ? console.log(error)
        : console.log(`Sever is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(error));

// test the api
app.get("/", (req, res) => {
  res.send("Server is live");
});

//  user api routes
app.use("/api/user", userRoutes);

// auth api routes
app.use("/api/auth", authRoutes);

// error handler middleware
app.use(errorHandler);
