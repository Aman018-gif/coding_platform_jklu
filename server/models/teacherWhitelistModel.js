import mongoose from "mongoose";

const teacherWhitelistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  usedAt: { type: Date, default: null },
}, { timestamps: true });

export const TeacherWhitelist = mongoose.model("TeacherWhitelist", teacherWhitelistSchema);
