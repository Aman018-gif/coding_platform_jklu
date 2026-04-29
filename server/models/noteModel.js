import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", default: null },
  contest_id: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", default: null },
  title: { type: String, default: "Personal Note" },
  content: { type: String, required: true },
}, { timestamps: true });

noteSchema.index({ user_id: 1 });
noteSchema.index({ user_id: 1, problem_id: 1 });

export const Note = mongoose.model("Note", noteSchema);
