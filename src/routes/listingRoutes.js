import express from "express";
import {
  addlistingController,
  deleteListingController,
  getListingController,
} from "../controllers/listingController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", isAuthenticated, addlistingController);
router.delete("/delete/:id", isAuthenticated, deleteListingController);
router.get("/get/:id", getListingController);

export default router;
