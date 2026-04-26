import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const Announcement = mongoose.model("Announcement", announcementSchema);
