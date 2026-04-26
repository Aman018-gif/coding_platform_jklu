import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Announcement } from "../models/announcementModel.js";
import { Class } from "../models/classModel.js";

export const createAnnouncement = catchAsyncError(async (req, res, next) => {
  const { class_id, title, content } = req.body;
  if (!class_id || !title || !content) {
    return next(new ErrorHandler("class_id, title, and content are required.", 400));
  }
  const classDetails = await Class.findById(class_id);
  if (!classDetails) return next(new ErrorHandler("Class not found.", 404));
  if (classDetails.teacher.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized.", 403));
  }
  const announcement = await Announcement.create({ class_id, author_id: req.user._id, title, content });
  await announcement.populate("author_id", "name email");
  return res.status(201).json({ success: true, announcement });
});

export const getAnnouncementsForClass = catchAsyncError(async (req, res, next) => {
  const { classId } = req.params;
  const announcements = await Announcement.find({ class_id: classId })
    .populate("author_id", "name")
    .sort({ createdAt: -1 })
    .lean();
  return res.status(200).json({ success: true, announcements });
});

export const deleteAnnouncement = catchAsyncError(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return next(new ErrorHandler("Announcement not found.", 404));
  if (announcement.author_id.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized.", 403));
  }
  await Announcement.findByIdAndDelete(req.params.id);
  return res.status(200).json({ success: true, message: "Announcement deleted." });
});
