import { catchAsync } from "../middlewares/catchAsync.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

// Create notification
export const createNotification = catchAsync(async (req, res) => {
  const { userId, title, message, type, relatedId, relatedModel } = req.body;
  
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    relatedId,
    relatedModel,
  });

  res.status(201).json(notification);
});

// Get user notifications
export const getUserNotifications = catchAsync(async (req, res) => {
  const userId = req.userInfo._id;
  const { limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Notification.countDocuments({ user: userId });
  const unreadCount = await Notification.countDocuments({ 
    user: userId, 
    isRead: false 
  });

  res.status(200).json({
    notifications,
    total,
    unreadCount,
    hasMore: skip + notifications.length < total,
  });
});

// Mark notification as read
export const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.userInfo._id;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.status(200).json(notification);
});

// Mark all as read
export const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.userInfo._id;

  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ message: "All notifications marked as read" });
});

// Delete notification
export const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.userInfo._id;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.status(200).json({ message: "Notification deleted" });
});

// Admin: Get all notifications
export const getAllNotifications = catchAsync(async (req, res) => {
  const { limit = 50, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({})
    .populate("user", "userName email")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Notification.countDocuments({});

  res.status(200).json({
    notifications,
    total,
    hasMore: skip + notifications.length < total,
  });
});

// Trigger notification for booking status change
export const notifyBookingStatusChange = catchAsync(async (req, res) => {
  const { bookingId, status, userEmail } = req.body;
  
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const statusMessages = {
    confirmed: "Your tour booking has been confirmed!",
    cancelled: "Your tour booking has been cancelled.",
    pending: "Your tour booking is pending approval.",
  };

  const notification = await Notification.create({
    user: user._id,
    title: "Booking Update",
    message: statusMessages[status] || "Your booking status has been updated.",
    type: "booking",
    relatedId: bookingId,
    relatedModel: "Booking",
  });

  res.status(201).json(notification);
});

// Create test notification for current user
export const createTestNotification = catchAsync(async (req, res) => {
  const userId = req.userInfo._id;
  
  const notification = await Notification.create({
    user: userId,
    title: "Welcome!",
    message: "This is a test notification to verify the system is working.",
    type: "info",
  });

  res.status(201).json(notification);
});
