import express from "express";
import {
  updateUserProfile,
  getUserListings,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// update user profile
router.put("/update-profile", isAuthenticated, updateUserProfile);

// get user
router.get("/listing/:id", isAuthenticated, getUserListings);

export default router;
