import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
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
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
});

contestSchema.index({ start_time: 1, end_time: 1 });
contestSchema.index({ slug: 1 }); // Essential for looking up contests by URL

export const Contest = mongoose.model("Contest", contestSchema);