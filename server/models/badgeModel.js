import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
    },
    // For weekly badges: rank 1-5 in a contest
    rank: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    // For weekly badges
    contest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      default: null,
    },
    contest_name: {
      type: String,
      default: null,
    },
    // For monthly badges
    month: {
      type: Number, // 1-12
      default: null,
    },
    year: {
      type: Number,
      default: null,
    },
    top5_count: {
      type: Number, // how many times they appeared in Top 5 that month
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate weekly badges for same user + contest
badgeSchema.index(
  { user_id: 1, type: 1, contest_id: 1 },
  { unique: true, partialFilterExpression: { type: "weekly" } }
);

// Prevent duplicate monthly badges for same user + month + year
badgeSchema.index(
  { user_id: 1, type: 1, month: 1, year: 1 },
  { unique: true, partialFilterExpression: { type: "monthly" } }
);

export const Badge = mongoose.model("Badge", badgeSchema);