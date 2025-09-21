import express from "express";
import { admin, isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  deleteUser,
  getAdminStats,
  getAllUsers,
} from "../controllers/adminController.js";
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

export default router;
