import express from "express";
import {
  deleteMessage,
  getContactMessage,
  sendContactMessage,
  updateMessageStatus,
} from "../controllers/contactController.js";
import { admin, isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// api/contact
router.post("/", sendContactMessage);
router.get("/", isAuthenticated, admin, getContactMessage);
router.delete("/:id", isAuthenticated, admin, deleteMessage);
router.put("/:id/read", updateMessageStatus);

export default router;
