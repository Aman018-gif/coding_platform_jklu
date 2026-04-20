import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
});

contestSchema.index({ start_time: 1, end_time: 1 });

export const Contest = mongoose.model("Contest", contestSchema);
