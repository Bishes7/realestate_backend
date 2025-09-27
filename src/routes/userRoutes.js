import express from "express";
import {
  updateUserProfile,
  getUserListings,
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { blockDemoUser } from "../middlewares/demoMiddleware.js";

const router = express.Router();

// update user profile
router.put(
  "/update-profile",
  isAuthenticated,
  blockDemoUser,
  updateUserProfile
);

// get user
router.get("/listing/:id", isAuthenticated, getUserListings);

// favorites
router.post("/favorites/:listingId", isAuthenticated, blockDemoUser, addFavorite);
router.delete(
  "/favorites/:listingId",
  isAuthenticated,
  blockDemoUser,
  removeFavorite
);
router.get("/favorites", isAuthenticated, getFavorites);

// (removed) saved searches

export default router;
