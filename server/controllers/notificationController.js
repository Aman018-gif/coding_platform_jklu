import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Notification } from "../models/notificationModel.js";

// Helper function to create notifications from other controllers
export const createNotification = async ({ recipient, sender, type, title, message, link }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification: ", error);
  }
};

export const getUserNotifications = catchAsyncError(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50); // Fetch top 50 recent notifications

  res.status(200).json({
    success: true,
    notifications,
  });
});

export const markAsRead = catchAsyncError(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  // Check if the notification belongs to the authenticated user
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to update this notification", 403));
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
  });
});

export const markAllAsRead = catchAsyncError(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});
