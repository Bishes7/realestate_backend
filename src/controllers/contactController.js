import { catchAsync } from "../middlewares/catchAsync.js";
import Contact from "../models/contactModal.js";

export const sendContactMessage = catchAsync(async (req, res) => {
  const { listingId, name, email, message } = req.body;

  if (!listingId || !name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newMessage = await Contact.create({
    listingId,
    name,
    email,
    message,
  });
  res.status(200).json({
    message: "Message saved successfully",
    data: newMessage,
  });
});
