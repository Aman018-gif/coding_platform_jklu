import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expected_output: { type: String, required: true },
  is_sample: { type: Boolean, default: false },
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], default: "MEDIUM" },
  category: { type: String, default: "" },
  time_limit: { type: Number, default: 2 },
  memory_limit: { type: Number, default: 256 },
  input_format: { type: String, default: "" },
  constraints: { type: String, default: "" },
  test_cases: [testCaseSchema],
  contest_id: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", default: null },
  order_index: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

problemSchema.index({ contest_id: 1, order_index: 1 });

export const Problem = mongoose.model("Problem", problemSchema);
