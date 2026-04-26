import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userModel.js";
import { Contest } from "../models/contestModel.js";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import { Class } from "../models/classModel.js";
import { IpLog } from "../models/ipLogModel.js";
import { TeacherWhitelist } from "../models/teacherWhitelistModel.js";

export const getPlatformStats = catchAsyncError(async (req, res, next) => {
  const [totalUsers, totalContests, totalProblems, totalSubmissions, totalClasses] =
    await Promise.all([
      User.countDocuments({ accountVerified: true }),
      Contest.countDocuments(),
      Problem.countDocuments(),
      Submission.countDocuments(),
      Class.countDocuments(),
    ]);

  const usersByRole = await User.aggregate([
    { $match: { accountVerified: true } },
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);
  const roleMap = { Student: 0, Teacher: 0, TA: 0, Admin: 0 };
  usersByRole.forEach((r) => { roleMap[r._id] = r.count; });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentActivity = await Submission.aggregate([
    { $match: { submitted_at: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$submitted_at" } } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res.status(200).json({
    success: true,
    stats: { totalUsers, totalContests, totalProblems, totalSubmissions, totalClasses, usersByRole: roleMap, recentActivity },
  });
});

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const { search, role, page = 1, limit = 20, sort } = req.query;
  const filter = { accountVerified: true };
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const sortOrder = sort === "points" ? { contest_points: -1 } : { createdAt: -1 };
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email role group contest_points total_solved streak createdAt")
      .sort(sortOrder)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(filter),
  ]);
  return res.status(200).json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["Student", "Teacher", "Admin", "TA"].includes(role)) {
    return next(new ErrorHandler("Invalid role.", 400));
  }
  if (id === req.user._id.toString()) {
    return next(new ErrorHandler("Cannot change your own role.", 400));
  }
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("name email role");
  if (!user) return next(new ErrorHandler("User not found.", 404));
  return res.status(200).json({ success: true, user });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (id === req.user._id.toString()) {
    return next(new ErrorHandler("Cannot delete yourself.", 400));
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) return next(new ErrorHandler("User not found.", 404));
  return res.status(200).json({ success: true, message: "User deleted." });
});

export const getAllClasses = catchAsyncError(async (req, res, next) => {
  const classes = await Class.find()
    .populate("teacher", "name email")
    .select("name year branch semester section joinCode joiningOpen createdAt students")
    .lean();
  return res.status(200).json({ success: true, classes });
});

export const getAllContests = catchAsyncError(async (req, res, next) => {
  const contests = await Contest.find()
    .populate("created_by", "name email")
    .sort({ start_time: -1 })
    .lean();
  return res.status(200).json({ success: true, contests });
});

export const getContestIpLogs = catchAsyncError(async (req, res, next) => {
  const { id: contest_id } = req.params;
  const logs = await IpLog.find({ contest_id })
    .populate("user_id", "name email")
    .sort({ timestamp: -1 })
    .lean();
  return res.status(200).json({ success: true, logs });
});

// ── Teacher Whitelist ─────────────────────────────────────────────────────────
export const getWhitelist = catchAsyncError(async (req, res, next) => {
  const entries = await TeacherWhitelist.find()
    .populate("addedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();
  return res.status(200).json({ success: true, entries });
});

export const addToWhitelist = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Email is required.", 400));

  const normalised = email.toLowerCase().trim();
  const existing = await TeacherWhitelist.findOne({ email: normalised });
  if (existing) return next(new ErrorHandler("Email is already in the whitelist.", 400));

  const entry = await TeacherWhitelist.create({ email: normalised, addedBy: req.user._id });
  await entry.populate("addedBy", "name email");
  return res.status(201).json({ success: true, entry });
});

export const removeFromWhitelist = catchAsyncError(async (req, res, next) => {
  const entry = await TeacherWhitelist.findById(req.params.id);
  if (!entry) return next(new ErrorHandler("Entry not found.", 404));
  if (entry.usedAt) return next(new ErrorHandler("Cannot remove a used entry — teacher is already registered.", 400));

  await TeacherWhitelist.findByIdAndDelete(req.params.id);
  return res.status(200).json({ success: true, message: "Entry removed." });
});
