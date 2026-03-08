import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Contest } from "../models/contestModel.js";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import { ContestLeaderboard } from "../models/leaderboardModel.js";

export const getContests = catchAsyncError(async (req, res, next) => {
  const contests = await Contest.find().sort({ start_time: -1 }).lean();
  return res.status(200).json({ success: true, contests });
});

export const registerForContest = catchAsyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Contest not found.", 404));

  if (new Date(contest.start_time) < new Date()) {
    return next(new ErrorHandler("Cannot register for a contest that has already started.", 400));
  }
  await Contest.findByIdAndUpdate(req.params.id, {
    $addToSet: { participants: req.user._id }
  });
  res.status(200).json({ success: true, message: "Registered successfully!" });
});

export const createContest = catchAsyncError(async (req, res, next) => {
  const { name, slug, start_time, end_time, is_active } = req.body;
  if (!name || !start_time || !end_time) {
    return next(new ErrorHandler("name, start_time and end_time are required.", 400));
  }
  const finalSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const contest = await Contest.create({
    name,
    slug: finalSlug,
    start_time: new Date(start_time),
    end_time: new Date(end_time),
    is_active: is_active !== false,
  });
  return res.status(201).json({ success: true, contest });
});

export const getContestById = catchAsyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id).lean();
  if (!contest) return next(new ErrorHandler("Contest not found.", 404));
  const problems = await Problem.find({ contest_id: contest._id })
    .sort({ order_index: 1 })
    .select("title slug difficulty category time_limit memory_limit description order_index")
    .lean();
  return res.status(200).json({ success: true, contest: { ...contest, problems } });
});

export const getActiveContest = catchAsyncError(async (req, res, next) => {
  const now = new Date();
  const contest = await Contest.findOne({
    is_active: true,
    start_time: { $lte: now },
    end_time: { $gte: now },
  })
    .sort({ end_time: 1 })
    .lean();
  if (!contest) {
    return res.status(200).json({ success: true, contest: null });
  }
  const problems = await Problem.find({ contest_id: contest._id })
    .sort({ order_index: 1 })
    .select("title slug difficulty")
    .limit(3)
    .lean();
  return res.status(200).json({ success: true, contest: { ...contest, problems } });
});

export const getLeaderboard = catchAsyncError(async (req, res, next) => {
  const { id: contest_id } = req.params;
  const hasNewLeaderboard = await ContestLeaderboard.exists({ contest_id: new mongoose.Types.ObjectId(contest_id) });
  if (hasNewLeaderboard) {
    const rows = await ContestLeaderboard.find({ contest_id })
      .sort({ solved_count: -1, penalty_minutes: 1, last_solved_at: 1 })
      .populate("user_id", "name email")
      .lean();

    const leaderboard = rows.map((r, i) => ({
      rank: i + 1,
      user_id: r.user_id?._id,
      name: r.user_id?.name,
      email: r.user_id?.email,
      solvedCount: r.solved_count,
      penaltyMinutes: r.penalty_minutes,
      lastSolvedAt: r.last_solved_at,
    }));
    return res.status(200).json({ success: true, leaderboard });
  }

  //backup

  const accepted = await Submission.aggregate([

    {
      $match: {
        contest_id: new mongoose.Types.ObjectId(contest_id),
        status: "Accepted"
      }
    },

    {
      $group: {
        _id: { user: "$user_id", problem: "$problem_id" },
        lastSubmission: { $max: "$submitted_at" }
      }
    },

    {
      $group: {
        _id: "$_id.user",
        count: { $sum: 1 },
        lastSubmission: { $max: "$lastSubmission" }
      }
    },

    { $sort: { count: -1, lastSubmission: 1 } },

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },

    { $unwind: "$user" },

    {
      $project: {
        name: "$user.name",
        email: "$user.email",
        solvedCount: "$count"
      }
    }

  ]);
  const rank = accepted.map((r, i) => ({ rank: i + 1, ...r }));
  return res.status(200).json({ success: true, leaderboard: rank });
});
