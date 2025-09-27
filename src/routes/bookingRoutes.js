import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/authMiddleware.js";
import { blockDemoUser } from "../middlewares/demoMiddleware.js";
import {
  createBooking,
  listMyBookings,
  adminListBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", isAuthenticated, blockDemoUser, createBooking);
router.get("/me", isAuthenticated, listMyBookings);
router.get("/admin", isAuthenticated, admin, adminListBookings);
router.put("/:id/status", isAuthenticated, admin, blockDemoUser, updateBookingStatus);

export default router;


