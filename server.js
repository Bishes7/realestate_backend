import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import { dbConnect } from "./src/config/dbConnect.js";
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import listingRoutes from "./src/routes/listingRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import path from "path";

import cookieParser from "cookie-parser";

const app = express();

// cookie parser

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

// listing api routes
app.use("/api/listing", listingRoutes);

// image upload routes
app.use("/api/upload", uploadRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// error handler middleware
app.use(errorHandler);
