import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Problem } from "../models/problemModel.js";
import mongoose from "mongoose";

function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export const createProblem = catchAsyncError(async (req, res, next) => {
  const {
    title,
    slug,
    description,
    difficulty,
    category,
    time_limit,
    memory_limit,
    input_format,
    constraints,
    test_cases,
    contest_id,
    order_index,
  } = req.body;

  if (!title || !description) {
    return next(new ErrorHandler("title and description are required.", 400));
  }

  const baseSlug = slug || toSlug(title);
  const order = order_index ?? 0;
  const finalSlug = contest_id ? `${baseSlug}-${contest_id}-${order}` : baseSlug;

  const existing = await Problem.findOne({ slug: finalSlug });
  if (existing) {
    return next(new ErrorHandler("Problem slug already exists.", 400));
  }

  const problem = await Problem.create({
    title,
    slug: finalSlug,
    description: description || "",
    difficulty: difficulty || "MEDIUM",
    category: category || "",
    time_limit: time_limit ?? 2,
    memory_limit: memory_limit ?? 256,
    input_format: input_format || "",
    constraints: constraints || "",
    test_cases: Array.isArray(test_cases) ? test_cases : [],
    contest_id: contest_id || null,
    order_index: order,
  });

  return res.status(201).json({ success: true, problem });
});

export const getProblems = catchAsyncError(async (req, res, next) => {
  const { contest_id } = req.query;
  const filter = contest_id
    ? { contest_id: new mongoose.Types.ObjectId(contest_id) }
    : {};
  const problems = await Problem.find(filter)
    .sort({ order_index: 1, created_at: 1 })
    .select(
      "title slug difficulty category time_limit memory_limit description order_index contest_id"
    )
    .lean();
  return res.status(200).json({ success: true, problems });
});

export const updateProblem = catchAsyncError(async (req, res, next) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) return next(new ErrorHandler("Problem not found.", 404));

  const fields = ["title", "description", "difficulty", "category", "time_limit", "memory_limit", "input_format", "constraints", "test_cases", "order_index"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) problem[f] = req.body[f];
  });
  await problem.save();
  return res.status(200).json({ success: true, problem });
});

export const deleteProblem = catchAsyncError(async (req, res, next) => {
  const problem = await Problem.findByIdAndDelete(req.params.id);
  if (!problem) return next(new ErrorHandler("Problem not found.", 404));
  return res.status(200).json({ success: true, message: "Problem deleted." });
});

export const getProblemById = catchAsyncError(async (req, res, next) => {
  const problem = await Problem.findById(req.params.id).lean();
  if (!problem) return next(new ErrorHandler("Problem not found.", 404));

  const { test_cases, ...rest } = problem;
  const allCases = test_cases || [];

  // Only expose sample test cases to the frontend
  // Fall back to first test case if none are marked as sample
  const sampleCases = allCases.filter((tc) => tc.is_sample);
  const publicTestCases = (
    sampleCases.length ? sampleCases : allCases.slice(0, 1)
  ).map((tc) => ({
    input: tc.input,
    expected_output: tc.expected_output || tc.output || "",
    is_sample: tc.is_sample,
  }));

  return res.status(200).json({
    success: true,
    problem: { ...rest, test_cases: publicTestCases },
  });
});