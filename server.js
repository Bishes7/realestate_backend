import express from "express";
import dotenv from "dotenv";

import cors from "cors";
dotenv.config();
console.log("OpenAI Key Loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");
import { dbConnect } from "./src/config/dbConnect.js";
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import listingRoutes from "./src/routes/listingRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import contactRoutes from "./src/routes/contactRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import chatBotRoutes from "./src/routes/chatBotRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// admin api routes
app.use("/api/admin", adminRoutes);
//  user api routes
app.use("/api/user", userRoutes);

// auth api routes
app.use("/api/auth", authRoutes);

// listing api routes
app.use("/api/listing", listingRoutes);

// image upload routes
app.use("/api/upload", uploadRoutes);

// contact Routes
app.use("/api/contact", contactRoutes);

// chatbot routes
app.use("/api/chatbot", chatBotRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// error handler middleware
app.use(errorHandler);
