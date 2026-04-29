import mongoose from "mongoose";

const labSchema = new mongoose.Schema({
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  title: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
  deadline: { type: Date },
  totalMarks: { type: Number, default: null },
  isVisible: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Index for fast class-based lab lookups (most common query pattern)
labSchema.index({ class_id: 1, isVisible: 1 });
// Index for due-soon queries (deadline range scans)
labSchema.index({ class_id: 1, deadline: 1 });

export const Lab = mongoose.model("Lab", labSchema);
