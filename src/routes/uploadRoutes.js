import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { addlistingController } from "../controllers/listingController.js";
import { blockDemoUser } from "../middlewares/demoMiddleware.js";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  blockDemoUser,
  upload.array("images", 5),
  addlistingController
);

export default router;
