import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: {
    type: String,
    minLength: [8, "Password must have at least 8 characters."],
    maxLength: [32, "Cannot have more than 32 characters."],
    select: false,
  },
  role: {
    type: String,
    enum: ["Student", "Teacher", "Sadmin", "TA"],
    default: "Student",
  },
  group: {
    type: String,
    trim: true,
  },
  accountVerified: { type: Boolean, default: false },
  verificationCode: Number,
  verificationCodeExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ── Profile Customization ──────────────────────────────
  avatar: { type: String, default: "" },
  wallpaper: { type: String, default: "" },
  headline: { type: String, default: "" },

  // ── Contest-only stats (labs excluded) ──────────────────────────────
  // These are updated by the submission flow whenever a contest submission is accepted.
  contest_points: {
    type: Number,
    default: 0,
  },
  contest_rank: {
    type: Number,
    default: null,
  },
  contests_participated: {
    type: Number,
    default: 0,
  },
  total_solved: {
    type: Number,
    default: 0,
  },

  // ── Split attendance ─────────────────────────────────────────────────
  // Contest attendance: updated when user registers + submits in a contest
  contest_attendance: {
    registered: { type: Number, default: 0 }, // total contests registered
    submitted: { type: Number, default: 0 },  // contests where user made ≥1 submission
  },
  // Lab attendance: updated when a lab submission is graded
  lab_attendance: {
    total_labs: { type: Number, default: 0 },       // total labs assigned
    on_time_submissions: { type: Number, default: 0 }, // labs submitted on time
  },

  // ── Streak ───────────────────────────────────────────────────────────
  streak: {
    type: Number,
    default: 0,
  },
  last_active_date: {
    type: Date,
    default: null,
  },
});

// ── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// ── Methods (unchanged from original) ───────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationCode = function () {
  function generateRandomFiveDigitNumber() {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, 0);
    return parseInt(firstDigit + remainingDigits);
  }
  const verificationCode = generateRandomFiveDigitNumber();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 10 * 60 * 1000;
  return verificationCode;
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

// ── Virtual: contest attendance % ───────────────────────────────────────────
userSchema.virtual("contest_attendance_pct").get(function () {
  if (!this.contest_attendance.registered) return 0;
  return Math.round(
    (this.contest_attendance.submitted / this.contest_attendance.registered) * 100
  );
});

// ── Virtual: lab attendance % ────────────────────────────────────────────────
userSchema.virtual("lab_attendance_pct").get(function () {
  if (!this.lab_attendance.total_labs) return 0;
  return Math.round(
    (this.lab_attendance.on_time_submissions / this.lab_attendance.total_labs) * 100
  );
});

export const User = mongoose.model("User", userSchema);