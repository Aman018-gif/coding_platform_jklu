import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  contest_id: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", default: null },
  source_code: { type: String, required: true },
  language_id: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error", "Pending", "Processing"],
    default: "Pending",
  },
  total_tests: { type: Number, default: 0 },
  passed_tests: { type: Number, default: 0 },
  run_output: { type: String, default: "" },
  submitted_at: { type: Date, default: Date.now },
});

submissionSchema.index({ user_id: 1, problem_id: 1, submitted_at: -1 });
submissionSchema.index({ contest_id: 1, user_id: 1, status: 1 });

export const Submission = mongoose.model("Submission", submissionSchema);
