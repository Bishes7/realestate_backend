import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/authMiddleware.js";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getAllNotifications,
  notifyBookingStatusChange,
  createTestNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// User notification routes
router.get("/", isAuthenticated, getUserNotifications);
router.put("/:id/mark-read", isAuthenticated, (req, res, next) => {
  console.log("Notification route PUT /:id/mark-read called with ID:", req.params.id);
  next();
}, markAsRead);
router.put("/read-all", isAuthenticated, markAllAsRead);
router.delete("/:id", isAuthenticated, deleteNotification);

// Admin routes
router.get("/admin", isAuthenticated, admin, getAllNotifications);
router.post("/", isAuthenticated, createNotification);
router.post("/booking-status", isAuthenticated, notifyBookingStatusChange);
router.post("/test", isAuthenticated, createTestNotification);

export default router;
