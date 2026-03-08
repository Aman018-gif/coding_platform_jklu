import mongoose from "mongoose";

const solvedProblemSchema = new mongoose.Schema(
  {
    problem_id: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    solved_at: { type: Date, required: true },
    penalty_minutes: { type: Number, required: true },
  },
  { _id: false }
);

const contestLeaderboardSchema = new mongoose.Schema(
  {
    contest_id: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    solved_count: { type: Number, default: 0 },
    penalty_minutes: { type: Number, default: 0 }, // ICPC-style: sum of problem penalties
    last_solved_at: { type: Date, default: null },

    // Track wrong attempts per problem until solved.
    attempts: { type: Map, of: Number, default: {} }, // key: problem_id string -> wrong attempts count
    solved: { type: [solvedProblemSchema], default: [] },
  },
  { timestamps: true }
);

contestLeaderboardSchema.index({ contest_id: 1, solved_count: -1, penalty_minutes: 1, last_solved_at: 1 });
contestLeaderboardSchema.index({ contest_id: 1, user_id: 1 }, { unique: true });

export const ContestLeaderboard = mongoose.model("ContestLeaderboard", contestLeaderboardSchema);

