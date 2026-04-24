import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Problem } from "../models/problemModel.js";
import { Submission } from "../models/submissionModel.js";
import { Contest } from "../models/contestModel.js";
import { User } from "../models/userModel.js";
import { ContestLeaderboard } from "../models/leaderboardModel.js";
import { createSubmission, createSubmissionWithLimits, normalizeStatus } from "../utils/judge0.js";
import { createNotification } from "./notificationController.js";

/**
 * Update a user's daily practice streak.
 * Rules:
 *   - If today is the same calendar day as last_active_date → already counted, no change.
 *   - If today is exactly the day after last_active_date → consecutive, streak++.
 *   - If last_active_date is null OR more than 1 day ago → streak resets to 1.
 * Uses UTC dates so the comparison is timezone-consistent.
 */
async function updateUserStreak(userId) {
  const user = await User.findById(userId).select("streak last_active_date");
  if (!user) return;

  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);         // midnight today (UTC)

  if (user.last_active_date) {
    const lastUTC = new Date(user.last_active_date);
    lastUTC.setUTCHours(0, 0, 0, 0);        // midnight of last active day

    const diffDays = Math.round(
      (todayUTC.getTime() - lastUTC.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return;              // already active today
    if (diffDays === 1) {
      user.streak = (user.streak || 0) + 1; // consecutive day
    } else {
      user.streak = 1;                      // streak broken — restart at 1
    }
  } else {
    user.streak = 1;                        // first ever activity
  }

  user.last_active_date = new Date();
  await user.save({ validateModifiedOnly: true });
}


function normalizeOutput(out) {
  return String(out || "")
    .replace(/\r\n/g, "\n")
    .trimEnd();
}

function buildJudge0Limits(problem) {
  const timeLimit = Number(problem?.time_limit);
  const memoryLimitMb = Number(problem?.memory_limit);
  const limits = {};
  if (Number.isFinite(timeLimit) && timeLimit > 0) {
    limits.cpu_time_limit = timeLimit;
    limits.wall_time_limit = Math.max(timeLimit, timeLimit + 1);
  }
  if (Number.isFinite(memoryLimitMb) && memoryLimitMb > 0) {
    limits.memory_limit = Math.floor(memoryLimitMb * 1024);
  }
  return limits;
}

async function updateContestLeaderboardOnSubmission({ contest_id, problem_id, user_id, status, submitted_at }) {
  if (!contest_id) return;

  const contest = await Contest.findById(contest_id).select("start_time").lean();
  if (!contest?.start_time) return;

  const now = submitted_at ? new Date(submitted_at) : new Date();
  const minutesSinceStart = Math.max(0, Math.floor((now - new Date(contest.start_time)) / 60000));
  const problemKey = String(problem_id);

  let doc = await ContestLeaderboard.findOne({ contest_id, user_id });
  if (!doc) {
    doc = await ContestLeaderboard.create({
      contest_id,
      user_id,
      solved_count: 0,
      penalty_minutes: 0,
      last_solved_at: null,
      attempts: {},
      solved: [],
    });
  }

  const alreadySolved = doc.solved.some((s) => String(s.problem_id) === problemKey);
  if (alreadySolved) return;

  if (status !== "Accepted") {
    const prev = Number(doc.attempts?.get(problemKey) || 0);
    doc.attempts.set(problemKey, prev + 1);
    await doc.save();
    return;
  }

  const wrongAttempts = Number(doc.attempts?.get(problemKey) || 0);
  const penalty = minutesSinceStart + wrongAttempts * 20;

  doc.solved.push({ problem_id, solved_at: now, penalty_minutes: penalty });
  doc.solved_count = doc.solved.length;
  doc.penalty_minutes = doc.solved.reduce((sum, s) => sum + Number(s.penalty_minutes), 0);
  doc.last_solved_at = now;
  await doc.save();
}

/**
 * RUN CODE: run against all sample test cases; do not save submission.
 */
export const runCode = catchAsyncError(async (req, res, next) => {
  const { source_code, language_id, problem_id, custom_input } = req.body;
  if (!source_code || language_id == null) {
    return next(new ErrorHandler("source_code and language_id are required.", 400));
  }

  let sampleCases = [];
  let limits = {};

  if (problem_id) {
    const problem = await Problem.findById(problem_id);
    if (problem?.test_cases?.length) {
      const samples = problem.test_cases.filter((t) => t.is_sample);
      sampleCases = samples.length ? samples : [problem.test_cases[0]];
    }
    limits = buildJudge0Limits(problem);
  }

  // If custom input provided, just run that one
  if (custom_input) {
    sampleCases = [{ input: custom_input, expected_output: "" }];
  }

  if (sampleCases.length === 0) {
    sampleCases = [{ input: "", expected_output: "" }];
  }

  // Run all sample cases
  const results = [];
  for (let i = 0; i < sampleCases.length; i++) {
    const tc = sampleCases[i];
    let result;
    try {
      result = Object.keys(limits).length
        ? await createSubmissionWithLimits(source_code, Number(language_id), tc.input, limits)
        : await createSubmission(source_code, Number(language_id), tc.input);
    } catch (e) {
      results.push({
        index: i + 1,
        status: "Error",
        stdout: "",
        stderr: e.message,
        compile_output: "",
        time: null,
        memory: null,
      });
      continue;
    }

    const statusId = result.status?.id;
    const description = result.status?.description;
    const status = normalizeStatus(statusId, description);
    const actual = normalizeOutput(result.stdout);
    const expected = normalizeOutput(tc.expected_output);
    const passed = status === "Accepted" && actual === expected;

    results.push({
      index: i + 1,
      status: passed ? "Accepted" : status === "Accepted" ? "Wrong Answer" : status,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      compile_output: result.compile_output || "",
      time: result.time,
      memory: result.memory,
    });
  }

  const allPassed = results.every((r) => r.status === "Accepted");
  const firstResult = results[0] || {};

  return res.status(200).json({
    success: true,
    message: "Run completed.",
    run_result: {
      status: allPassed
        ? "Accepted"
        : results.find((r) => r.status !== "Accepted")?.status || "Wrong Answer",
      stdout: firstResult.stdout || "",
      stderr: firstResult.stderr || "",
      compile_output: firstResult.compile_output || "",
      time: firstResult.time,
      memory: firstResult.memory,
      case_results: results,
    },
  });
});

/**
 * SUBMIT: run against all test cases, determine Accepted/Wrong Answer, save submission.
 */
export const submitCode = catchAsyncError(async (req, res, next) => {
  const { source_code, language_id, language, problem_id, contest_id, class_id, lab_id } = req.body;
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
  let maxTime = 0;
  let maxMemory = 0;
  const limits = buildJudge0Limits(problem);

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let result;
    try {
      result = await createSubmissionWithLimits(
        source_code,
        Number(language_id),
        tc.input,
        limits
      );
    } catch (e) {
      finalStatus = "Runtime Error";
      outputs.push({ index: i + 1, status: "Error", stderr: e.message });
      break;
    }

    const statusId = result.status?.id;
    const description = result.status?.description;
    const status = normalizeStatus(statusId, description);
    const actual = normalizeOutput(result.stdout);
    const expected = normalizeOutput(tc.expected_output);

    const t = Number(result.time);
    if (Number.isFinite(t)) maxTime = Math.max(maxTime, t);
    const m = Number(result.memory);
    if (Number.isFinite(m)) maxMemory = Math.max(maxMemory, m);

    if (status !== "Accepted") {
      finalStatus = status;
      outputs.push({ index: i + 1, status });
      break;
    }
    if (actual !== expected) {
      finalStatus = "Wrong Answer";
      outputs.push({ index: i + 1, status: "Wrong Answer" });
      break;
    }
    passed++;
    outputs.push({ index: i + 1, status: "Accepted" });
  }

  const submission = await Submission.create({
    user_id,
    problem_id,
    contest_id: contest_id || null,
    class_id: class_id || null,
    lab_id: lab_id || null,
    source_code,
    language_id: Number(language_id),
    language: language || "",
    status: finalStatus,
    total_tests: testCases.length,
    passed_tests: passed,
    total_testcases: testCases.length,
    passed_testcases: passed,
    execution_time: maxTime || null,
    memory: maxMemory || null,
    run_output: JSON.stringify(outputs),
    submission_time: new Date(),
  });

  await updateContestLeaderboardOnSubmission({
    contest_id: contest_id || null,
    problem_id,
    user_id,
    language,
    status: finalStatus,
    submitted_at: submission.submission_time,
  });

  // Update streak on any Accepted submission
  if (finalStatus === "Accepted") {
    await updateUserStreak(user_id);
  }

  // Notify User
  await createNotification({
    recipient: user_id,
    type: "SUBMISSION",
    title: "Submission Evaluated",
    message: finalStatus === "Accepted" ? `Your submission for problem passed all test cases.` : `Your submission was graded as ${finalStatus}.`,
    link: `/submissions/${submission._id}`
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
      execution_time: submission.execution_time,
      memory: submission.memory,
    },
  });
});

/**
 * Get submissions for a user (and optional problem/contest) for leaderboard/history.
 */
export const getSubmissions = catchAsyncError(async (req, res, next) => {
  const { problem_id, contest_id, class_id, lab_id } = req.query;
  const user_id = req.user._id;
  const filter = { user_id };
  if (problem_id) filter.problem_id = problem_id;
  if (contest_id) filter.contest_id = contest_id;
  if (class_id) filter.class_id = class_id;
  if (lab_id) filter.lab_id = lab_id;

  const submissions = await Submission.find(filter)
    .sort({ submitted_at: -1 })
    .limit(50)
    .populate("problem_id", "title difficulty")
    .lean();

  return res.status(200).json({ success: true, submissions });
});