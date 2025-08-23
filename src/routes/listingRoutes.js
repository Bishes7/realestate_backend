import express from "express";
import {
  addlistingController,
  deleteListingController,
  getListingController,
  getListings,
  updateListingController,
} from "../controllers/listingController.js";
import { admin, isAuthenticated } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/add", isAuthenticated, addlistingController);
router.delete("/delete/:id", isAuthenticated, deleteListingController);
router.get("/get/:id", getListingController);
router.get("/get", getListings);
router.put(
  "/:id",
  isAuthenticated,
  admin,
  upload.array("images", 5),
  updateListingController
);

export default router;
