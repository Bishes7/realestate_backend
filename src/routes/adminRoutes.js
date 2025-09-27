import express from "express";
import { admin, isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  deleteUser,
  getAdminStats,
  getAllUsers,
  approveListing,
  rejectListing,
  getAdvancedAnalytics,
} from "../controllers/adminController.js";
import { adminGetAllListings } from "../controllers/listingController.js";
import { updateUserProfile } from "../controllers/userController.js";
import { blockDemoUser } from "../middlewares/demoMiddleware.js";

const router = express.Router();

// only admins can excess
// admin stats
router.get("/stats", isAuthenticated, admin, getAdminStats);
router.get("/users", isAuthenticated, admin, getAllUsers);
router.delete("/users/:id", isAuthenticated, admin, blockDemoUser, deleteUser);
router.put(
  "/users/:id/role",
  isAuthenticated,
  admin,
  blockDemoUser,
  updateUserProfile
);

// listing moderation
router.put("/listings/:id/approve", isAuthenticated, admin, blockDemoUser, approveListing);
router.put("/listings/:id/reject", isAuthenticated, admin, blockDemoUser, rejectListing);
router.get("/listings", isAuthenticated, admin, adminGetAllListings);

// analytics
router.get("/analytics", isAuthenticated, admin, getAdvancedAnalytics);

export default router;
