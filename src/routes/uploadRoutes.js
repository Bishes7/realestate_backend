import express from "express";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", upload.array("images", 5), (req, res) => {
  const filePaths = req.files.map((file) => `/uploads/${file.filename}`);
  res.json({ message: "Upload Successful", files: filePaths });
});

export default router;
