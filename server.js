import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { dbConnect } from "./src/config/dbConnect.js";
import userRoutes from "./src/routes/userRoutes.js";

const app = express();
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

// routes for user
app.use("/api/user", userRoutes);
