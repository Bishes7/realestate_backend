import express from "express";
import { admin, isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  deleteUser,
  getAdminStats,
  getAllUsers,
} from "../controllers/adminController.js";
import { updateUserProfile } from "../controllers/userController.js";

const router = express.Router();

// only admins can excess
router.get("/users", isAuthenticated, admin, getAllUsers);
router.delete("/users/:id", isAuthenticated, admin, deleteUser);
router.put("/users/:id/role", isAuthenticated, admin, updateUserProfile);
// admin stats
router.get("/stats", isAuthenticated, admin, getAdminStats);

export default router;
