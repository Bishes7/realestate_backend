import express from "express";
import {
  saveMessage,
  getChatHistory,
  handleChatMessage,
} from "../controllers/chatBotController.js";

const router = express.Router();

router.post("/save", saveMessage);
router.get("/history/:sessionId", getChatHistory);
router.post("/message", handleChatMessage);

export default router;
