import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { dbConnect } from "./src/config/dbConnect.js";
import userRoutes from "./src/routes/userRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();

// middlewares
app.use(express.json());

// handle errprs
app.use((req, res, err, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
// middleware

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
