import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Contest } from "../models/contestModel.js";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import { ContestLeaderboard } from "../models/leaderboardModel.js";
import { calculateWeeklyBadges } from "../utils/badgeCalculator.js";
import { IpLog } from "../models/ipLogModel.js";

export const getContests = catchAsyncError(async (req, res, next) => {
  const contests = await Contest.find().sort({ start_time: -1 }).lean();
  return res.status(200).json({ success: true, contests });
});

export const getContestSubmissions = catchAsyncError(async (req, res, next) => {
  const contest_id = req.params.id;
  const filter = { contest_id };

  // Uncomment if you want students to only see their OWN submissions in the contest
  // const user_id = req.user._id;
  // filter.user_id = user_id;

  const submissions = await Submission.find(filter)
    .sort({ submitted_at: -1 })
    .populate("problem_id", "title")
    .lean();
    
  return res.status(200).json({ success: true, submissions });
});

export const registerForContest = catchAsyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Contest not found.", 404));

  const registrationLimit = new Date(new Date(contest.start_time).getTime() + 15 * 60 * 1000);
  if (new Date() > registrationLimit) {
    return next(new ErrorHandler("Registration closed. You can only register up to 15 minutes after the contest starts.", 400));
  }

  // ── Group eligibility check ───────────────────────────────────────────────
  const restrictedGroups = ["First Year", "Second Year"];
  if (contest.participantGroup && restrictedGroups.includes(contest.participantGroup)) {
    const userGroup = req.user.group || "";
    const isInGroup = userGroup === contest.participantGroup;
    const isAdditional = contest.additionalParticipants
      .map((id) => id.toString())
      .includes(req.user._id.toString());

    if (!isInGroup && !isAdditional) {
      return next(
        new ErrorHandler(
          `This contest is restricted to ${contest.participantGroup} students.`,
          403
        )
      );
    }
  }

  await Contest.findByIdAndUpdate(req.params.id, {
    $addToSet: { participants: req.user._id },
  });

  // ── Increment contest_attendance.registered for this user ──────────────
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "contest_attendance.registered": 1 },
  });

  const regIp = (req.ip || req.socket?.remoteAddress || "unknown").replace(/^::ffff:/, "");
  IpLog.create({ contest_id: req.params.id, user_id: req.user._id, ip: regIp, event: "register" }).catch(() => {});

  res.status(200).json({ success: true, message: "Registered successfully!" });
});

export const createContest = catchAsyncError(async (req, res, next) => {
  const {
    name,
    slug,
    start_time,
    end_time,
    is_active,
    organizer,
    markForAttendance,
    moderators,
    participantGroup,
    additionalParticipants,
    notifyStart,
    notifyResults,
    bannerImageURL,
    description,
    isPublic
  } = req.body;

  if (!name || !start_time || !end_time) {
    return next(new ErrorHandler("name, start_time and end_time are required.", 400));
  }

  // Security Check: Ensure user is authenticated to extract created_by
  if (!req.user || !req.user._id) {
    return next(new ErrorHandler("Unauthorized. User ID missing from request.", 401));
  }

  const finalSlug =
    slug ||
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // Format and secure the moderators array
  let validModeratorIds = [];
  if (Array.isArray(moderators)) {
    for (const mod of moderators) {
      if (mongoose.Types.ObjectId.isValid(mod)) {
        validModeratorIds.push(new mongoose.Types.ObjectId(mod));
      } else if (typeof mod === 'string' && mod.includes('@')) {
        const user = await User.findOne({ email: mod }).select('_id');
        if (user) {
          validModeratorIds.push(user._id);
        }
      }
    }
  }
  
  // Ensure the creator is always included as a moderator
  const stringifiedMods = validModeratorIds.map(id => id.toString());
  if (!stringifiedMods.includes(req.user._id.toString())) {
    validModeratorIds.push(req.user._id);
  }

  // Resolve additionalParticipants: accept array of _id strings or emails
  let validAdditionalIds = [];
  if (Array.isArray(additionalParticipants)) {
    for (const ap of additionalParticipants) {
      if (mongoose.Types.ObjectId.isValid(ap)) {
        validAdditionalIds.push(new mongoose.Types.ObjectId(ap));
      } else if (typeof ap === 'string' && ap.includes('@')) {
        const u = await User.findOne({ email: ap }).select('_id');
        if (u) validAdditionalIds.push(u._id);
      }
    }
  }

  const contest = await Contest.create({
    name,
    slug: finalSlug,
    start_time: new Date(start_time),
    end_time: new Date(end_time),
    is_active: is_active !== false,
    organizer,
    markForAttendance,
    moderators: validModeratorIds,
    participantGroup,
    additionalParticipants: validAdditionalIds,
    notifyStart,
    notifyResults,
    bannerImageURL,
    description,
    isPublic: isPublic !== false,
    created_by: req.user._id,
  });

  return res.status(201).json({ success: true, contest });
});

export const updateContest = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const contest = await Contest.findById(id);
  if (!contest) return next(new ErrorHandler("Contest not found.", 404));

  const isOwner = contest.created_by?.toString() === req.user._id.toString();
  const isModerator = contest.moderators.some(m => m.toString() === req.user._id.toString());
  if (!isOwner && !isModerator) {
    return next(new ErrorHandler("Not authorized to update this contest.", 403));
  }

  const {
    name,
    slug,
    start_time,
    end_time,
    is_active,
    organizer,
    markForAttendance,
    moderators,
    participantGroup,
    additionalParticipants,
    notifyStart,
    notifyResults,
    bannerImageURL,
    description,
    isPublic,
  } = req.body;

  if (name) contest.name = name;
  if (slug) contest.slug = slug;
  if (start_time) contest.start_time = new Date(start_time);
  if (end_time) contest.end_time = new Date(end_time);
  if (is_active !== undefined) contest.is_active = is_active;
  if (organizer !== undefined) contest.organizer = organizer;
  if (markForAttendance !== undefined) contest.markForAttendance = markForAttendance;
  if (participantGroup !== undefined) contest.participantGroup = participantGroup;
  if (notifyStart !== undefined) contest.notifyStart = notifyStart;
  if (notifyResults !== undefined) contest.notifyResults = notifyResults;
  if (bannerImageURL !== undefined) contest.bannerImageURL = bannerImageURL;
  if (description !== undefined) contest.description = description;
  if (isPublic !== undefined) contest.isPublic = isPublic;

  // Resolve additionalParticipants for update
  if (additionalParticipants !== undefined) {
    let validAdditionalIds = [];
    if (Array.isArray(additionalParticipants)) {
      for (const ap of additionalParticipants) {
        if (mongoose.Types.ObjectId.isValid(ap)) {
          validAdditionalIds.push(new mongoose.Types.ObjectId(ap));
        } else if (typeof ap === 'string' && ap.includes('@')) {
          const u = await User.findOne({ email: ap }).select('_id');
          if (u) validAdditionalIds.push(u._id);
        }
      }
    }
    contest.additionalParticipants = validAdditionalIds;
  }

  let validModeratorIds = [];
  if (Array.isArray(moderators)) {
    for (const mod of moderators) {
      if (mongoose.Types.ObjectId.isValid(mod)) {
        validModeratorIds.push(new mongoose.Types.ObjectId(mod));
      } else if (typeof mod === 'string' && mod.includes('@')) {
        const user = await User.findOne({ email: mod }).select('_id');
        if (user) {
          validModeratorIds.push(user._id);
        }
      }
    }
  }
  const stringifiedMods = validModeratorIds.map(id => id.toString());
  if (!stringifiedMods.includes(req.user._id.toString())) {
    validModeratorIds.push(req.user._id);
  }
  if (moderators !== undefined) contest.moderators = validModeratorIds;

  await contest.save();

  return res.status(200).json({ success: true, contest });
});

export const deleteContest = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const contest = await Contest.findById(id);
  if (!contest) return next(new ErrorHandler("Contest not found.", 404));

  const isOwner = contest.created_by?.toString() === req.user._id.toString();
  if (!isOwner) {
    return next(new ErrorHandler("Only the owner can delete this contest.", 403));
  }

  await Contest.findByIdAndDelete(id);

  return res.status(200).json({ success: true, message: "Contest deleted successfully!" });
});

export const getContestById = catchAsyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id).populate('moderators', 'name email').lean();
  if (!contest) return next(new ErrorHandler("Contest not found.", 404));
  
  if (contest.isPublic === false && req.user) {
    const isOwner = contest.created_by?.toString() === req.user._id.toString();
    const isModerator = contest.moderators.some(m => m._id.toString() === req.user._id.toString());
    if (!isOwner && !isModerator) {
      return next(new ErrorHandler("Not authorized to view this contest.", 403));
    }
  }
  
  const problems = await Problem.find({ contest_id: contest._id })
    .sort({ order_index: 1 })
    .select("title slug difficulty category time_limit memory_limit description order_index")
    .lean();
  return res.status(200).json({ success: true, contest: { ...contest, problems } });
});

export const getContestBySlug = catchAsyncError(async (req, res, next) => {
  const contest = await Contest.findOne({ slug: req.params.slug }).lean();
  if (!contest) return next(new ErrorHandler("Contest not found.", 404));
  const problems = await Problem.find({ contest_id: contest._id })
    .sort({ order_index: 1 })
    .select("title slug difficulty category time_limit memory_limit description order_index")
    .lean();
  return res.status(200).json({ success: true, contest: { ...contest, problems } });
});

export const addProblemsToContest = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { problemIds } = req.body;

  const contest = await Contest.findById(id);
  if (!contest) return next(new ErrorHandler("Contest not found.", 404));

  const isOwner = contest.created_by?.toString() === req.user._id.toString();
  const isModerator = contest.moderators.some(m => m.toString() === req.user._id.toString());
  if (!isOwner && !isModerator) {
    return next(new ErrorHandler("Not authorized to update this contest.", 403));
  }

  if (Array.isArray(problemIds)) {
    await Contest.findByIdAndUpdate(id, {
      $addToSet: { problems: { $each: problemIds } },
    });
  }

  const updatedContest = await Contest.findById(id).lean();
  const problems = await Problem.find({ contest_id: updatedContest._id })
    .sort({ order_index: 1 })
    .lean();

  return res.status(200).json({ success: true, contest: { ...updatedContest, problems } });
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

export const getMyContests = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const contests = await Contest.find({ $or: [{ created_by: userId }, { moderators: userId }] }).sort({ start_time: -1 }).lean();

  const contestsWithRole = await Promise.all(contests.map(async (contest) => {
    const problems = await Problem.find({ contest_id: contest._id }).sort({ order_index: 1 }).lean();
    return { ...contest, problems, isOwner: contest.created_by?.toString() === userId.toString() };
  }));

  return res.status(200).json({ success: true, contests: contestsWithRole });
});
// ── NEW: End a contest (Admin only) ─────────────────────────────────────────
// POST /api/v1/contest/:id/end
// Marks the contest as finished and triggers weekly badge calculation.
export const endContest = catchAsyncError(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return next(new ErrorHandler("Contest not found.", 404));

  if (!contest.is_active) {
    return next(new ErrorHandler("Contest is already ended.", 400));
  }

  // Mark contest as inactive / finished
  contest.is_active = false;
  await contest.save();

  // Update contests_participated count for all users who made ≥1 submission
  // and increment their contest_attendance.submitted
  const participantIds = await Submission.distinct("user_id", {
    contest_id: contest._id,
  });

  if (participantIds.length > 0) {
    await User.updateMany(
      { _id: { $in: participantIds } },
      {
        $inc: {
          contests_participated: 1,
          "contest_attendance.submitted": 1,
        },
      }
    );
  }

  // Award contest points to leaderboard participants
  // Points formula: (solved_count * 100) - penalty deduction
  const leaderboardRows = await ContestLeaderboard.find({
    contest_id: contest._id,
  }).lean();

  for (const row of leaderboardRows) {
    const points = Math.max(0, row.solved_count * 100 - Math.floor(row.penalty_minutes));
    await User.findByIdAndUpdate(row.user_id, {
      $inc: { contest_points: points, total_solved: row.solved_count },
    });
  }

  // Trigger weekly badge calculation (async, non-blocking)
  calculateWeeklyBadges(contest._id).catch((err) =>
    console.error("[endContest] Badge calculation failed:", err)
  );

  return res.status(200).json({
    success: true,
    message: `Contest '${contest.name}' ended. Badges and points are being calculated.`,
  });
});

export const getLeaderboard = catchAsyncError(async (req, res, next) => {
  const { id: contest_id } = req.params;
  const contestObjectId = new mongoose.Types.ObjectId(contest_id);

  const hasNewLeaderboard = await ContestLeaderboard.exists({
    contest_id: contestObjectId,
  });

  if (hasNewLeaderboard) {
    const rows = await ContestLeaderboard.find({ contest_id: contestObjectId })
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
      solved: r.solved || [],
    }));

    return res.status(200).json({ success: true, leaderboard });
  }

  // Fallback to aggregation from submissions
  const accepted = await Submission.aggregate([
    { $match: { contest_id: contestObjectId, status: "Accepted" } },
    {
      $group: {
        _id: { user: "$user_id", problem: "$problem_id" },
        lastSubmission: { $max: "$submitted_at" },
      },
    },
    {
      $group: {
        _id: "$_id.user",
        count: { $sum: 1 },
        lastSubmission: { $max: "$lastSubmission" },
      },
    },
    { $sort: { count: -1, lastSubmission: 1 } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        email: "$user.email",
        solvedCount: "$count",
      },
    },
  ]);

  const rank = accepted.map((r, i) => ({ rank: i + 1, ...r }));
  return res.status(200).json({ success: true, leaderboard: rank });
});

export const getPresets = catchAsyncError(async (req, res, next) => {
  const presets = {
    difficulties: ["Easy", "Medium", "Hard"],
    categories: ["Arrays", "Graphs", "DP", "Trees", "Strings", "Math", "Greedy", "Other"],
    groups: ["First year", "Second Year", "Coding Club", "Public"],
  };
  return res.status(200).json({ success: true, presets });
});

// ── Merged Leaderboard ────────────────────────────────────────────────────────
// POST /api/v1/contests/merged-leaderboard
// Body: { contestIds: [id1, id2, ...] }
// Returns a combined leaderboard matrix across multiple contests.
export const getMergedLeaderboard = catchAsyncError(async (req, res, next) => {
  const { contestIds } = req.body;

  if (!Array.isArray(contestIds) || contestIds.length === 0) {
    return next(new ErrorHandler("contestIds array is required.", 400));
  }

  // Validate all IDs
  const validIds = contestIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    return next(new ErrorHandler("No valid contest IDs provided.", 400));
  }

  // Fetch contest names for column headers
  const contests = await Contest.find({ _id: { $in: validIds } })
    .select("_id name")
    .lean();

  // Map id → name for ordering
  const idToName = {};
  contests.forEach((c) => { idToName[c._id.toString()] = c.name; });

  // Keep order as provided by caller
  const orderedIds = validIds.filter((id) => idToName[id]);

  // userMap: userId → { name, email, scores: { contestId: solvedCount } }
  const userMap = {};

  for (const contestId of orderedIds) {
    const objectId = new mongoose.Types.ObjectId(contestId);

    const hasLB = await ContestLeaderboard.exists({ contest_id: objectId });

    if (hasLB) {
      const rows = await ContestLeaderboard.find({ contest_id: objectId })
        .populate("user_id", "name email")
        .lean();

      for (const row of rows) {
        const uid = row.user_id?._id?.toString();
        if (!uid) continue;
        if (!userMap[uid]) {
          userMap[uid] = { name: row.user_id.name, email: row.user_id.email, scores: {} };
        }
        userMap[uid].scores[contestId] = row.solved_count;
      }
    } else {
      // Fallback: aggregate from submissions
      const accepted = await Submission.aggregate([
        { $match: { contest_id: objectId, status: "Accepted" } },
        { $group: { _id: { user: "$user_id", problem: "$problem_id" } } },
        { $group: { _id: "$_id.user", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $project: { name: "$user.name", email: "$user.email", count: 1 } },
      ]);

      for (const row of accepted) {
        const uid = row._id.toString();
        if (!userMap[uid]) {
          userMap[uid] = { name: row.name, email: row.email, scores: {} };
        }
        userMap[uid].scores[contestId] = row.count;
      }
    }
  }

  // Build merged rows
  const rows = Object.entries(userMap).map(([uid, data]) => {
    const contestScores = orderedIds.map((cid) => data.scores[cid] ?? 0);
    const combined = contestScores.reduce((a, b) => a + b, 0);
    return {
      name: data.name,
      email: data.email,
      contestScores, // array aligned with orderedIds
      combined,
    };
  });

  // Sort by combined desc
  rows.sort((a, b) => b.combined - a.combined);

  return res.status(200).json({
    success: true,
    contests: orderedIds.map((id) => ({ id, name: idToName[id] })),
    rows,
  });
});