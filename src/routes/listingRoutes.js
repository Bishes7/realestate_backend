import express from "express";
import {
  addlistingController,
  deleteListingController,
  getListingController,
  getListings,
  updateListingController,
  getPopularListings,
  getSimilarListings,
} from "../controllers/listingController.js";
import { admin, isAuthenticated } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { blockDemoUser } from "../middlewares/demoMiddleware.js";

const router = express.Router();

router.post("/add", isAuthenticated, blockDemoUser, addlistingController);
router.delete(
  "/delete/:id",
  isAuthenticated,
  blockDemoUser,
  deleteListingController
);
router.get("/get/:id", getListingController);
router.get("/get", getListings);
router.get("/popular", getPopularListings);
router.get("/similar/:id", getSimilarListings);
router.put(
  "/:id",
  isAuthenticated,
  admin,
  blockDemoUser,
  upload.array("images", 5),
  updateListingController
);

export default router;
