import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Note } from "../models/noteModel.js";

// @desc    Get all personal notes for the logged-in user
// @route   GET /api/v1/notes
// @access  Private
export const getUserNotes = catchAsyncError(async (req, res, next) => {
  const notes = await Note.find({ user_id: req.user._id })
    .populate("problem_id", "title")
    .populate("contest_id", "name")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    notes,
  });
});

// @desc    Get note for a specific problem
// @route   GET /api/v1/notes/problem/:problemId
// @access  Private
export const getNoteByProblem = catchAsyncError(async (req, res, next) => {
  const note = await Note.findOne({
    user_id: req.user._id,
    problem_id: req.params.problemId,
  });

  res.status(200).json({
    success: true,
    note,
  });
});

// @desc    Save (create/update) a note for a problem
// @route   POST /api/v1/notes/problem/:problemId
// @access  Private
export const saveNote = catchAsyncError(async (req, res, next) => {
  const { content, title, contest_id } = req.body;
  const { problemId } = req.params;

  if (content === undefined) {
    return next(new ErrorHandler("Content is required", 400));
  }

  // Find existing note
  let note = await Note.findOne({
    user_id: req.user._id,
    problem_id: problemId,
  });

  if (note) {
    // Update
    note.content = content;
    if (title) note.title = title;
    if (contest_id) note.contest_id = contest_id;
    await note.save();
  } else {
    // Create new
    note = await Note.create({
      user_id: req.user._id,
      problem_id: problemId,
      contest_id: contest_id || null,
      title: title || "Personal Note",
      content,
    });
  }

  res.status(200).json({
    success: true,
    note,
    message: "Note saved successfully",
  });
});

// @desc    Delete a note
// @route   DELETE /api/v1/notes/:id
// @access  Private
export const deleteNote = catchAsyncError(async (req, res, next) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user_id: req.user._id,
  });

  if (!note) {
    return next(new ErrorHandler("Note not found", 404));
  }

  await note.deleteOne();

  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
  });
});

// @desc    Clear a note for a problem (delete by problemId)
// @route   DELETE /api/v1/notes/problem/:problemId
// @access  Private
export const clearNoteByProblem = catchAsyncError(async (req, res, next) => {
  await Note.deleteOne({
    user_id: req.user._id,
    problem_id: req.params.problemId,
  });

  res.status(200).json({
    success: true,
    message: "Note cleared successfully",
  });
});
