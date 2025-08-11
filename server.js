import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import { dbConnect } from "./src/config/dbConnect.js";
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

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

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});
