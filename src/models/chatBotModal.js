import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true }, // can be user id or random session token
  messages: [messageSchema],
});

const ChatBot = mongoose.model("ChatBot", chatSchema);

export default ChatBot;
