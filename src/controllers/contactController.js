import { catchAsync } from "../middlewares/catchAsync.js";
import Contact from "../models/contactModal.js";

export const sendContactMessage = catchAsync(async (req, res) => {
  const { listingId, name, email, message, subject } = req.body;

  const newMessage = await Contact.create({
    listingId,
    name,
    email,
    subject,
    message,
  });
  res.status(200).json({
    message: "Message saved successfully",
    data: newMessage,
  });
});

export const getContactMessage = catchAsync(async (req, res) => {
  const message = await Contact.find({});

  if (message) {
    res.status(200).json(message);
  } else {
    res.status(400).json("No messages found");
  }
});

export const deleteMessage = catchAsync(async (req, res) => {
  const message = await Contact.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      message: "Message not found",
    });
  }
  await message.deleteOne();
  res.status(200).json({
    message: "Message successfully deleted",
  });
});

export const updateMessageStatus = catchAsync(async (req, res) => {
  console.log("Contact updateMessageStatus called with ID:", req.params.id);
  const message = await Contact.findById(req.params.id);
  if (!message) {
    console.log("Message not found for ID:", req.params.id);
    return res.status(404).json({
      message: "Message not found",
    });
  }
  console.log("Message found, updating status to read");
  message.status = "read";
  await message.save();
  console.log("Message status updated successfully");
  res.status(200).json({
    message: "Message marked as read",
    data: message,
  });
});
