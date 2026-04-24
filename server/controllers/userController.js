import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { Badge } from "../models/badgeModel.js";
import { Submission } from "../models/submissionModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Problem } from "../models/problemModel.js";
import twilio from "twilio";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// ── All your existing controllers (unchanged) ────────────────────────────────

export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new ErrorHandler("All fields are required.", 400));
    }
    const existingUser = await User.findOne({
      $or: [{ email, accountVerified: true }],
    });
    if (existingUser) {
      return next(new ErrorHandler("Email is already used.", 400));
    }
    const registerationAttemptsByUser = await User.find({
      $or: [{ email, accountVerified: false }],
    });
    if (registerationAttemptsByUser.length > 3) {
      return next(
        new ErrorHandler(
          "You have exceeded the maximum number of attempts (3). Please try again after an hour.",
          400
        )
      );
    }
    const userData = { name, email, password };
    const user = await User.create(userData);
    const verificationCode = await user.generateVerificationCode();
    await user.save();
    sendVerificationCode(verificationCode, name, email, res);
  } catch (error) {
    next(error);
  }
});

async function sendVerificationCode(verificationCode, name, email, res) {
  try {
    const message = generateEmailTemplate(verificationCode);
    sendEmail({ email, subject: "Your Verification Code", message });
    res.status(200).json({
      success: true,
      message: `Verification email successfully sent to ${name}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Verification code failed to send.",
    });
  }
}

function generateEmailTemplate(verificationCode) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f6f9; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
      <div style="background-color: #0b3d91; padding: 20px; text-align: center;">
        <img src="YOUR_LOGO_URL_HERE" alt="JKLU Logo" style="height: 60px; margin-bottom: 10px;">
        <h2 style="color: #ffffff; margin: 0;">JK Lakshmipat University</h2>
        <p style="color: #dfe6f5; margin: 5px 0 0 0;">Coding Platform – Email Verification</p>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #333;">Dear Student,</p>
        <p style="font-size: 16px; color: #333;">
          Welcome to the <strong>JKLU Coding Platform</strong> 🎓  
          Please use the verification code below to complete your registration.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background-color: #0b3d91; color: #ffffff; padding: 15px 35px; font-size: 28px; letter-spacing: 5px; font-weight: bold; border-radius: 6px;">
            ${verificationCode}
          </div>
        </div>
        <p style="font-size: 15px; color: #555;">This code will expire in <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="#" style="background-color: #f37021; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 15px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">If you did not request this email, you can safely ignore it.</p>
      </div>
      <div style="background-color: #f4f6f9; padding: 15px; text-align: center;">
        <p style="font-size: 13px; color: #777; margin: 5px;">© 2026 JK Lakshmipat University | Jaipur, India</p>
        <p style="font-size: 12px; color: #999; margin: 5px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>`;
}

export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const userAllEntries = await User.find({
      email,
      accountVerified: false,
    }).sort({ createdAt: -1 });
    if (!userAllEntries) {
      return next(new ErrorHandler("User not found.", 404));
    }
    let user;
    if (userAllEntries.length > 1) {
      user = userAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        $or: [{ email, accountVerified: false }],
      });
    } else {
      user = userAllEntries[0];
    }
    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP.", 400));
    }
    const currentTime = Date.now();
    const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();
    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP Expired.", 400));
    }
    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });
    sendToken(user, 200, "Account Verified.", res);
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error.", 500));
  }
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }
  const user = await User.findOne({ email, accountVerified: true }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }
  sendToken(user, 200, "User logged in successfully.", res);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", { expires: new Date(Date.now()), httpOnly: true })
    .json({ success: true, message: "Logged out successfully." });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({ success: true, user });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;
  try {
    sendEmail({ email: user.email, subject: "JKLU CODING HOUR RESET PASSWORD", message });
    res.status(200).json({ success: true, message: `Email sent to ${user.email} successfully.` });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message ? error.message : "Cannot send reset password token.", 500));
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Reset password token is invalid or has been expired.", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password & confirm password do not match.", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, "Reset Password Successfully.", res);
});

export const getStudentsByGroup = catchAsyncError(async (req, res, next) => {
  const { group } = req.query;
  
  const filter = { role: "Student" };
  if (group) {
    filter.group = group;
  }
  
  const students = await User.find(filter).select("name email group").lean();
  
  res.status(200).json({
    success: true,
    students,
  });
});

export const searchUsers = catchAsyncError(async (req, res, next) => {
  const { role, query } = req.query;

  // Only return verified accounts — avoids ghost/test registrations
  const filter = { accountVerified: true };
  if (role) {
    filter.role = role;
  }
  if (query && query.trim()) {
    filter.$or = [
      { name: { $regex: query.trim(), $options: 'i' } },
      { email: { $regex: query.trim(), $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .select("name email role group")
    .limit(10)
    .lean();

  res.status(200).json({
    success: true,
    users,
  });
});

// Temporary endpoint for testing purposes
export const upgradeToTeacher = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  user.role = "Teacher";
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, message: "User upgraded to Teacher role successfully.", user });
});

// ── NEW: getProfile ──────────────────────────────────────────────────────────
// GET /api/v1/user/profile
// Returns all data needed by ProfilePage.jsx



export const getProfile = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  // 1. Fetch fresh user doc (includes contest_points, attendance, etc.)
  const user = await User.findById(userId).lean();
  if (!user) return next(new ErrorHandler("User not found.", 404));

  // 2. Fetch all badges for this user
  const badges = await Badge.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .lean();

  const weeklyBadges = badges
    .filter((b) => b.type === "weekly")
    .map((b) => ({
      rank: b.rank,
      contestName: b.contest_name,
      contestId: b.contest_id,
      earnedAt: b.createdAt,
    }));

  const monthlyBadges = badges
    .filter((b) => b.type === "monthly")
    .map((b) => ({
      month: monthLabel(b.month, b.year),
      count: b.top5_count,
      earnedAt: b.createdAt,
    }));

  // 3. Recent activity: last 10 submissions by this user
  const recentSubmissions = await Submission.find({ user_id: userId })
    .sort({ submitted_at: -1 })
    .limit(10)
    .populate("problem_id", "title")
    .lean();

  const recentActivity = recentSubmissions.map((s) => {
    const isContest = !!s.contest_id;
    const type = isContest ? "contest" : s.lab_id ? "lab" : "solve";
    const title = s.problem_id?.title || "Unknown Problem";
    return {
      id: s._id,
      action:
        type === "contest"
          ? `Submitted '${title}' in a contest`
          : type === "lab"
            ? `Lab submission — '${title}'`
            : `Solved '${title}'`,
      status: s.status,
      time: timeAgo(s.submitted_at),
      type,
    };
  });

  // 4. Compute global contest rank (rank by contest_points descending)
  //    We count how many users have MORE points than this user.
  const usersAhead = await User.countDocuments({
    accountVerified: true,
    contest_points: { $gt: user.contest_points || 0 },
  });
  const contestRank = usersAhead + 1;

  // 5. Heatmap: Aggregate accepted submissions in the last 6 months
  // We use $toDate to forcefully convert any manual string inputs to Dates to prevent crashes.
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const heatmapData = await Submission.aggregate([
    {
      $match: {
        user_id: user._id,
      }
    },
    {
       $addFields: {
          convertedDate: { $toDate: "$submitted_at" }
       }
    },
    {
      $match: {
        convertedDate: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$convertedDate" } },
        count: { $sum: 1 }
      }
    }
  ]);
  
  const heatmap = {};
  heatmapData.forEach(item => {
    heatmap[item._id] = item.count;
  });

  // 6. Problems Solved (Difficulty Breakdown)
  // Count total problems of each difficulty in the DB
  const totals = await Problem.aggregate([
    { $group: { _id: "$difficulty", count: { $sum: 1 } } }
  ]);
  const totalMap = { EASY: 0, MEDIUM: 0, HARD: 0 };
  totals.forEach(t => {
    totalMap[(t._id || "MEDIUM").toUpperCase()] = t.count;
  });

  // Count unique problems solved by this user, grouped by difficulty
  const solves = await Submission.aggregate([
    { $match: { user_id: user._id, status: "Accepted" } },
    { $group: { _id: "$problem_id" } }, // unique problems
    {
      $lookup: {
        from: "problems",
        localField: "_id",
        foreignField: "_id",
        as: "problemDetails"
      }
    },
    { $unwind: "$problemDetails" },
    { $group: { _id: "$problemDetails.difficulty", count: { $sum: 1 } } }
  ]);
  
  const solveMap = { EASY: 0, MEDIUM: 0, HARD: 0 };
  solves.forEach(s => {
    solveMap[(s._id || "MEDIUM").toUpperCase()] = s.count;
  });

  const solveBreakdown = {
    easy: solveMap.EASY,
    easyTotal: totalMap.EASY,
    medium: solveMap.MEDIUM,
    mediumTotal: totalMap.MEDIUM,
    hard: solveMap.HARD,
    hardTotal: totalMap.HARD,
  };

  // 7. Build response
  return res.status(200).json({
    success: true,
    profile: {
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      wallpaper: user.wallpaper,
      headline: user.headline,

      // Contest-only rank & points
      contestRank,
      contestPoints: user.contest_points || 0,
      contestsParticipated: user.contests_participated || 0,
      totalSolved: user.total_solved || 0,

      // Streak
      streak: user.streak || 0,

      // Tiered badges
      weeklyBadges,
      monthlyBadges,

      // Activity & Stats
      recentActivity,
      heatmap,
      solveBreakdown,
    },
  });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function monthLabel(month, year) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[month - 1]} ${year}`;
}

function timeAgo(date) {
  // Use Math.abs to prevent negative seconds if server time is slightly off or UTC offsets mismatch.
  const seconds = Math.abs(Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// ── NEW: updateProfile ──────────────────────────────────────────────────────────
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, avatar, wallpaper, headline } = req.body;
  const userId = req.user._id;

  const validUpdates = {};
  if (name !== undefined) validUpdates.name = name;
  if (avatar !== undefined) validUpdates.avatar = avatar;
  if (wallpaper !== undefined) validUpdates.wallpaper = wallpaper;
  if (headline !== undefined) validUpdates.headline = headline;

  const user = await User.findByIdAndUpdate(userId, validUpdates, { new: true, runValidators: true });

  if (!user) return next(new ErrorHandler("User not found.", 404));

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    profile: {
      name: user.name,
      avatar: user.avatar,
      wallpaper: user.wallpaper,
      headline: user.headline
    }
  });
});