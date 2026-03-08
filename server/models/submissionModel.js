import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  contest_id: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", default: null },
  source_code: { type: String, required: true },
  language_id: { type: Number, required: true },
  // Convenience fields matching frontend/feature requirements
  language: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error", "Pending", "Processing"],
    default: "Pending",
  },
  total_tests: { type: Number, default: 0 },
  passed_tests: { type: Number, default: 0 },
  // Alternate naming requested (kept in sync by controller)
  total_testcases: { type: Number, default: 0 },
  passed_testcases: { type: Number, default: 0 },
  execution_time: { type: Number, default: null }, // seconds (max across testcases)
  memory: { type: Number, default: null }, // KB (max across testcases)
  run_output: { type: String, default: "" },
  submitted_at: { type: Date, default: Date.now },
  submission_time: { type: Date, default: Date.now },
});

submissionSchema.index({ user_id: 1, problem_id: 1, submitted_at: -1 });
submissionSchema.index({ contest_id: 1, user_id: 1, status: 1 });

export const Submission = mongoose.model("Submission", submissionSchema);
