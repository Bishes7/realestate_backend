import express from "express";
import {
  deleteMessage,
  getContactMessage,
  sendContactMessage,
  updateMessageStatus,
} from "../controllers/contactController.js";
import { admin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { blockDemoUser } from "../middlewares/demoMiddleware.js";

const router = express.Router();

// api/contact
router.post("/", sendContactMessage);
router.get("/", isAuthenticated, admin, getContactMessage);
router.delete("/:id", isAuthenticated, admin, blockDemoUser, deleteMessage);
router.put(
  "/:id/mark-read",
  isAuthenticated,
  admin,
  blockDemoUser,
  (req, res, next) => {
    console.log("Contact route PUT /:id/mark-read called with ID:", req.params.id);
    next();
  },
  updateMessageStatus
);

export default router;
