import express from "express";
import { sendContactMessage } from "../controllers/contactController.js";

const router = express.Router();

// api/contact
router.post("/", sendContactMessage);

export default router;
