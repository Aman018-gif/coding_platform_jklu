import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import { createSubmission, runWithPolling, normalizeStatus } from "../utils/judge0.js";
import { executeCode } from "../utils/judge0.js";

/**
 * RUN CODE: run against a single (sample) test case; do not save submission.
 */

export const runCode = catchAsyncError(async (req, res, next) => {
  const { source_code, language_id, problem_id, custom_input } = req.body;
  if (!source_code || language_id == null) {
    return next(new ErrorHandler("source_code and language_id are required.", 400));
  }

  let stdin = custom_input || "";
  if (!custom_input && problem_id) {
    const problem = await Problem.findById(problem_id);
    if (problem?.test_cases?.length) {
      const sample = problem.test_cases.find((t) => t.is_sample) || problem.test_cases[0];
      stdin = sample.input || "";
    }
  }

  let result;
  try {
    result = await createSubmission(source_code, Number(language_id), stdin, true);
  } catch (e) {
    if (e.message.includes("JUDGE0_API_KEY")) {
      return res.status(503).json({
        success: false,
        message: "Code execution service is not configured.",
        run_result: { status: "Configuration Error", stdout: "", stderr: e.message },
      });
    }
    return res.status(502).json({
      success: false,
      message: "Code execution failed.",
      run_result: { status: "Error", stdout: "", stderr: e.message },
    });
  }

  const statusId = result.status?.id;
  const status = statusId != null ? normalizeStatus(statusId) : "Runtime Error";
  const run_result = {
    status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    compile_output: result.compile_output || "",
    time: result.time,
    memory: result.memory,
  };

  return res.status(200).json({
    success: true,
    message: "Run completed.",
    run_result,
  });
});

/**
 * SUBMIT: run against all test cases, determine Accepted/Wrong Answer, save submission for leaderboard.
 */
export const submitCode = catchAsyncError(async (req, res, next) => {
  const { source_code, language_id, problem_id, contest_id } = req.body;
  const user_id = req.user._id;

  if (!source_code || language_id == null || !problem_id) {
    return next(new ErrorHandler("source_code, language_id, and problem_id are required.", 400));
  }

  const problem = await Problem.findById(problem_id);
  if (!problem) return next(new ErrorHandler("Problem not found.", 404));
  const testCases = problem.test_cases || [];
  if (testCases.length === 0) {
    return next(new ErrorHandler("Problem has no test cases.", 400));
  }

  let passed = 0;
  let finalStatus = "Accepted";
  const outputs = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let result;
    try {
      result = await createSubmission(source_code, Number(language_id), tc.input, true);
    } catch (e) {
      finalStatus = "Runtime Error";
      outputs.push({ index: i + 1, status: "Error", stderr: e.message });
      break;
    }

    const statusId = result.status?.id;
    const status = statusId != null ? normalizeStatus(statusId) : "Runtime Error";
    const actual = (result.stdout || "").trim();
    const expected = (tc.expected_output || "").trim();

    if (status !== "Accepted") {
      finalStatus = status;
      outputs.push({ index: i + 1, status, stdout: actual, expected });
      break;
    }
    if (actual !== expected) {
      finalStatus = "Wrong Answer";
      outputs.push({ index: i + 1, status: "Wrong Answer", stdout: actual, expected });
      break;
    }
    passed++;
    outputs.push({ index: i + 1, status: "Accepted" });
  }

  const submission = await Submission.create({
    user_id,
    problem_id,
    contest_id: contest_id || null,
    source_code,
    language_id: Number(language_id),
    status: finalStatus,
    total_tests: testCases.length,
    passed_tests: passed,
    run_output: JSON.stringify(outputs),
  });

  return res.status(200).json({
    success: true,
    message: finalStatus === "Accepted" ? "All test cases passed." : "Some test cases failed.",
    submission: {
      _id: submission._id,
      status: submission.status,
      passed_tests: submission.passed_tests,
      total_tests: submission.total_tests,
      run_output: outputs,
    },
  });
});

/**
 * Get submissions for a user (and optional problem/contest) for leaderboard/history.
 */
export const getSubmissions = catchAsyncError(async (req, res, next) => {
  const { problem_id, contest_id } = req.query;
  const user_id = req.user._id;
  const filter = { user_id };
  if (problem_id) filter.problem_id = problem_id;
  if (contest_id) filter.contest_id = contest_id;

  const submissions = await Submission.find(filter)
    .sort({ submitted_at: -1 })
    .limit(50)
    .populate("problem_id", "title difficulty")
    .lean();

  return res.status(200).json({ success: true, submissions });
});


