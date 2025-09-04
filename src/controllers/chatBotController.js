import { catchAsync } from "../middlewares/catchAsync.js";
import ChatBot from "../models/chatBotModal.js";

/**
 * Save user or bot messages into the chat session
 */
export const saveMessage = catchAsync(async (req, res) => {
  const { sessionId, sender, text } = req.body;

  if (!sessionId || !sender || !text) {
    return res
      .status(400)
      .json({ message: "sessionId, sender, and text are required" });
  }

  // Find existing chat session or create a new one
  let chatSession = await ChatBot.findOne({ sessionId });
  if (!chatSession) {
    chatSession = new ChatBot({ sessionId, messages: [] });
  }

  // Add the message
  chatSession.messages.push({ sender, text });

  await chatSession.save();

  res.status(200).json({
    message: "Message saved successfully",
    chat: chatSession,
  });
});

/**
 * Fetch full chat history for a session
 */
export const getChatHistory = catchAsync(async (req, res) => {
  const { sessionId } = req.params;

  const chatSession = await ChatBot.findOne({ sessionId });

  if (!chatSession) {
    return res.status(404).json({ message: "Chat session not found" });
  }

  res.status(200).json(chatSession.messages);
});

/**
 * Handle dynamic bot replies
 */
export const handleChatMessage = catchAsync(async (req, res) => {
  const { sessionId, message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Please type a message first." });
  }

  const text = message.toLowerCase();
  let reply = "";

  // Detect budget (simple regex for numbers like 1000, 1,500)
  const budgetMatch = text.match(/\$?(\d{3,5})/);
  const budget = budgetMatch ? budgetMatch[1] : null;

  // Detect area (example list of areas)
  const areas = [
    "sydney",
    "parramatta",
    "strathfield",
    "melbourne",
    "brisbane",
  ];
  const area = areas.find((a) => text.includes(a));

  if (text.includes("rent")) {
    if (budget && area) {
      reply = `Looking to rent in ${area}? 🏠 We have options under $${budget}. Would you like to see some listings?`;
    } else if (budget) {
      reply = `Got it! You want to rent under $${budget}. Which area are you interested in?`;
    } else if (area) {
      reply = `Looking to rent in ${area}? 🏠 What's your budget range?`;
    } else {
      reply =
        "Looking to rent? 🏠 Please share your preferred area and budget.";
    }
  } else if (text.includes("buy")) {
    if (budget && area) {
      reply = `Buying in ${area}? 🏡 We have properties starting from $${budget}. Want me to list them?`;
    } else if (budget) {
      reply = `Looking to buy with a budget of $${budget}? Which area are you considering?`;
    } else if (area) {
      reply = `Buying in ${area}? 🏡 What's your price range?`;
    } else {
      reply = "Looking to buy? 🏡 Please share your area and budget.";
    }
  } else if (text.includes("hi") || text.includes("hello")) {
    reply = "Hi there! 👋 How can I help you today?";
  } else {
    reply =
      "I'm here to assist you! Could you clarify what you need? (e.g., rent in Sydney under 1500)";
  }

  // Save to DB
  let chatSession = await ChatBot.findOne({ sessionId });
  if (!chatSession) {
    chatSession = new ChatBot({ sessionId, messages: [] });
  }
  chatSession.messages.push({ sender: "user", text: message });
  chatSession.messages.push({ sender: "bot", text: reply });
  await chatSession.save();

  res.status(200).json({ reply });
});
