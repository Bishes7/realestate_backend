import { catchAsync } from "../middlewares/catchAsync.js";
import Booking from "../models/bookingModel.js";
import Listing from "../models/listingModel.js";

export const createBooking = catchAsync(async (req, res) => {
  const userId = req.userInfo._id;
  const { listingId, scheduledAt, note } = req.body;
  if (!listingId || !scheduledAt) {
    return res.status(400).json({ message: "listingId and scheduledAt required" });
  }
  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(404).json({ message: "Listing not found" });
  const booking = await Booking.create({
    user: userId,
    listing: listingId,
    scheduledAt: new Date(scheduledAt),
    note,
  });
  res.status(201).json(booking);
});

export const listMyBookings = catchAsync(async (req, res) => {
  const userId = req.userInfo._id;
  const bookings = await Booking.find({ user: userId })
    .populate("listing")
    .sort({ createdAt: -1 });
  res.status(200).json(bookings);
});

export const adminListBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({})
    .populate("listing")
    .populate("user", "userName email")
    .sort({ createdAt: -1 });
  res.status(200).json(bookings);
});

export const updateBookingStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = await Booking.findById(id).populate("user");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  booking.status = status || booking.status;
  await booking.save();

  // Create notification for user
  const Notification = (await import("../models/notificationModel.js")).default;
  const statusMessages = {
    confirmed: "Your tour booking has been confirmed! We'll contact you soon.",
    cancelled: "Your tour booking has been cancelled. Please contact us if you have questions.",
    pending: "Your tour booking is pending approval. We'll review it shortly.",
  };

  await Notification.create({
    user: booking.user._id,
    title: "Booking Update",
    message: statusMessages[status] || "Your booking status has been updated.",
    type: "booking",
    relatedId: booking._id,
    relatedModel: "Booking",
  });

  res.status(200).json(booking);
});


