import express from "express";
import {
  addlistingController,
  deleteListingController,
} from "../controllers/listingController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", isAuthenticated, addlistingController);
router.delete("/delete/:id", isAuthenticated, deleteListingController);

export default router;
