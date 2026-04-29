import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  organizer: { type: String, trim: true },
  markForAttendance: { type: Boolean, default: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  additionalParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  participantGroup: { type: String, trim: true },
  notifyStart: { type: Boolean, default: false },
  notifyResults: { type: Boolean, default: false },
  bannerImageURL: { type: String, trim: true },
  description: { type: String, trim: true },
  isPublic: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null, index: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
});

examSchema.index({ start_time: 1, end_time: 1 });
examSchema.index({ slug: 1 });
examSchema.index({ created_by: 1 });

export const Exam = mongoose.model("Exam", examSchema);
