import express from "express";
import {
  saveMessage,
  getChatHistory,
  handleChatMessage,
  clearChatHistory,
  testPropertySearch,
  getAllProperties,
} from "../controllers/chatBotController.js";

const router = express.Router();

router.post("/save", saveMessage);
router.get("/history/:sessionId", getChatHistory);
router.post("/message", handleChatMessage);
router.delete("/clear/:sessionId", clearChatHistory);
router.get("/test-search", testPropertySearch);
router.get("/all-properties", getAllProperties);

export default router;
