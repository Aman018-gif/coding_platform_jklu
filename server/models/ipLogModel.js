import mongoose from "mongoose";

const ipLogSchema = new mongoose.Schema({
  contest_id: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ip: { type: String, required: true },
  event: { type: String, enum: ["register", "submit"], required: true },
  timestamp: { type: Date, default: Date.now },
});

ipLogSchema.index({ contest_id: 1, user_id: 1 });

export const IpLog = mongoose.model("IpLog", ipLogSchema);
