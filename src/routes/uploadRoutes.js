import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { addlistingController } from "../controllers/listingController.js";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  upload.array("images", 5),
  addlistingController
);

export default router;
