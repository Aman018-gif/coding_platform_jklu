import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Exam } from "../models/examModel.js";
import { Problem } from "../models/problemModel.js";
import { User } from "../models/userModel.js";
import { Class } from "../models/classModel.js";
import mongoose from "mongoose";

export const getExams = catchAsyncError(async (req, res, next) => {
  const exams = await Exam.find().sort({ start_time: -1 }).lean();
  return res.status(200).json({ success: true, exams });
});

export const getExamById = catchAsyncError(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id)
    .populate("moderators", "name email")
    .lean();
  if (!exam) return next(new ErrorHandler("Exam not found.", 404));

  const problems = await Problem.find({ contest_id: exam._id })
    .sort({ order_index: 1 })
    .select("title slug difficulty category time_limit memory_limit description order_index")
    .lean();

  return res.status(200).json({ success: true, exam: { ...exam, problems } });
});

export const getExamBySlug = catchAsyncError(async (req, res, next) => {
  const exam = await Exam.findOne({ slug: req.params.slug }).lean();
  if (!exam) return next(new ErrorHandler("Exam not found.", 404));

  const problems = await Problem.find({ contest_id: exam._id })
    .sort({ order_index: 1 })
    .select("title slug difficulty category time_limit memory_limit description order_index")
    .lean();

  return res.status(200).json({ success: true, exam: { ...exam, problems } });
});

export const createExam = catchAsyncError(async (req, res, next) => {
  const {
    name, slug, start_time, end_time, is_active, organizer, markForAttendance,
    moderators, participantGroup, additionalParticipants, notifyStart, notifyResults,
    bannerImageURL, description, isPublic, class_id,
  } = req.body;

  if (!name || !start_time || !end_time) {
    return next(new ErrorHandler("name, start_time and end_time are required.", 400));
  }

  const finalSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  let validModeratorIds = [];
  if (Array.isArray(moderators)) {
    for (const mod of moderators) {
      if (mongoose.Types.ObjectId.isValid(mod)) {
        validModeratorIds.push(new mongoose.Types.ObjectId(mod));
      } else if (typeof mod === "string" && mod.includes("@")) {
        const user = await User.findOne({ email: mod }).select("_id");
        if (user) validModeratorIds.push(user._id);
      }
    }
  }
  if (!validModeratorIds.map(id => id.toString()).includes(req.user._id.toString())) {
    validModeratorIds.push(req.user._id);
  }

  let validAdditionalIds = [];
  if (Array.isArray(additionalParticipants)) {
    for (const ap of additionalParticipants) {
      if (mongoose.Types.ObjectId.isValid(ap)) {
        validAdditionalIds.push(new mongoose.Types.ObjectId(ap));
      } else if (typeof ap === "string" && ap.includes("@")) {
        const u = await User.findOne({ email: ap }).select("_id");
        if (u) validAdditionalIds.push(u._id);
      }
    }
  }

  const exam = await Exam.create({
    name, slug: finalSlug,
    start_time: new Date(start_time), end_time: new Date(end_time),
    is_active: is_active !== false, organizer, markForAttendance,
    moderators: validModeratorIds, participantGroup,
    additionalParticipants: validAdditionalIds,
    notifyStart, notifyResults, bannerImageURL, description,
    isPublic: isPublic !== false, created_by: req.user._id,
    class_id: class_id || null,
  });

  return res.status(201).json({ success: true, exam });
});

export const updateExam = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const exam = await Exam.findById(id);
  if (!exam) return next(new ErrorHandler("Exam not found.", 404));

  const isOwner = exam.created_by?.toString() === req.user._id.toString();
  const isModerator = exam.moderators.some(m => m.toString() === req.user._id.toString());
  if (!isOwner && !isModerator && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to update this exam.", 403));
  }

  const fields = ["name", "slug", "start_time", "end_time", "is_active", "organizer",
    "markForAttendance", "participantGroup", "notifyStart", "notifyResults",
    "bannerImageURL", "description", "isPublic"];
  fields.forEach(f => { if (req.body[f] !== undefined) exam[f] = req.body[f]; });

  if (req.body.additionalParticipants !== undefined) {
    let ids = [];
    for (const ap of req.body.additionalParticipants || []) {
      if (mongoose.Types.ObjectId.isValid(ap)) ids.push(new mongoose.Types.ObjectId(ap));
      else if (typeof ap === "string" && ap.includes("@")) {
        const u = await User.findOne({ email: ap }).select("_id");
        if (u) ids.push(u._id);
      }
    }
    exam.additionalParticipants = ids;
  }

  if (req.body.moderators !== undefined) {
    let ids = [];
    for (const mod of req.body.moderators || []) {
      if (mongoose.Types.ObjectId.isValid(mod)) ids.push(new mongoose.Types.ObjectId(mod));
      else if (typeof mod === "string" && mod.includes("@")) {
        const u = await User.findOne({ email: mod }).select("_id");
        if (u) ids.push(u._id);
      }
    }
    if (!ids.map(id => id.toString()).includes(req.user._id.toString())) ids.push(req.user._id);
    exam.moderators = ids;
  }

  await exam.save();
  return res.status(200).json({ success: true, exam });
});

export const deleteExam = catchAsyncError(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return next(new ErrorHandler("Exam not found.", 404));

  const isOwner = exam.created_by?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "Admin") {
    return next(new ErrorHandler("Only the owner can delete this exam.", 403));
  }

  await Exam.findByIdAndDelete(req.params.id);
  return res.status(200).json({ success: true, message: "Exam deleted." });
});

export const addProblemsToExam = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { problemIds } = req.body;

  const exam = await Exam.findById(id);
  if (!exam) return next(new ErrorHandler("Exam not found.", 404));

  const isOwner = exam.created_by?.toString() === req.user._id.toString();
  const isModerator = exam.moderators.some(m => m.toString() === req.user._id.toString());
  if (!isOwner && !isModerator && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized.", 403));
  }

  if (Array.isArray(problemIds)) {
    await Exam.findByIdAndUpdate(id, { $addToSet: { problems: { $each: problemIds } } });
  }

  const updated = await Exam.findById(id).lean();
  const problems = await Problem.find({ contest_id: updated._id }).sort({ order_index: 1 }).lean();
  return res.status(200).json({ success: true, exam: { ...updated, problems } });
});

export const registerForExam = catchAsyncError(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return next(new ErrorHandler("Exam not found.", 404));

  const registrationLimit = new Date(new Date(exam.start_time).getTime() + 15 * 60 * 1000);
  if (new Date() > registrationLimit) {
    return next(new ErrorHandler("Registration closed.", 400));
  }

  await Exam.findByIdAndUpdate(req.params.id, { $addToSet: { participants: req.user._id } });
  await User.findByIdAndUpdate(req.user._id, { $inc: { "contest_attendance.registered": 1 } });

  return res.status(200).json({ success: true, message: "Registered for exam!" });
});

export const getMyExams = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const exams = await Exam.find({
    $or: [{ created_by: userId }, { moderators: userId }],
  }).sort({ start_time: -1 }).lean();

  const examsWithMeta = await Promise.all(
    exams.map(async (exam) => {
      const problems = await Problem.find({ contest_id: exam._id }).sort({ order_index: 1 }).lean();
      return { ...exam, problems, isOwner: exam.created_by?.toString() === userId.toString() };
    })
  );

  return res.status(200).json({ success: true, exams: examsWithMeta });
});

export const getExamsForClass = catchAsyncError(async (req, res, next) => {
  const { classId } = req.params;

  const classDetails = await Class.findById(classId).lean();
  if (!classDetails) return next(new ErrorHandler("Class not found.", 404));

  const isTeacher = classDetails.teacher.toString() === req.user._id.toString();
  const isStudent = classDetails.students.some(s => s.toString() === req.user._id.toString());

  if (!isTeacher && !isStudent && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized.", 403));
  }

  const exams = await Exam.find({ class_id: classId })
    .sort({ start_time: -1 })
    .lean();

  const examsWithMeta = await Promise.all(
    exams.map(async (exam) => {
      const problems = await Problem.find({ contest_id: exam._id }).sort({ order_index: 1 }).lean();
      return { ...exam, problems, isOwner: exam.created_by?.toString() === req.user._id.toString() };
    })
  );

  return res.status(200).json({ success: true, exams: examsWithMeta });
});
