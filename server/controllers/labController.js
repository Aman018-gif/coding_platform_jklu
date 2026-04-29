import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Lab } from "../models/labModel.js";
import { Class } from "../models/classModel.js";
import { Submission } from "../models/submissionModel.js";
import { createNotification } from "./notificationController.js";

export const createLab = catchAsyncError(async (req, res, next) => {
  const { class_id, title, questions, deadline, isVisible } = req.body;

  if (!class_id || !title || !questions) {
    return next(new ErrorHandler("Please provide class_id, title, and questions.", 400));
  }

  const classDetails = await Class.findById(class_id);
  if (!classDetails) {
    return next(new ErrorHandler("Class not found.", 404));
  }

  if (classDetails.teacher.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to manage labs for this class.", 403));
  }

  const newLab = await Lab.create({
    class_id,
    title,
    questions,
    deadline,
    isVisible: isVisible !== undefined ? isVisible : true,
    createdBy: req.user._id,
  });

  if (newLab.isVisible) {
    // Notify all students in the class
    classDetails.students.forEach(async (studentId) => {
      await createNotification({
        recipient: studentId,
        sender: req.user._id,
        type: "LAB",
        title: "New Lab Assigned",
        message: `A new lab "${title}" has been added to your class.`,
        link: `/class/${class_id}/labs/${newLab._id}`
      });
    });
  }

  res.status(201).json({
    success: true,
    message: "Lab created successfully.",
    newLab,
  });
});

export const updateLab = catchAsyncError(async (req, res, next) => {
  const labId = req.params.id;
  const { title, questions, deadline, isVisible } = req.body;

  let lab = await Lab.findById(labId);

  if (!lab) {
    return next(new ErrorHandler("Lab not found.", 404));
  }

  const classDetails = await Class.findById(lab.class_id);

  if (classDetails.teacher.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to manage labs for this class.", 403));
  }

  lab.title = title || lab.title;
  lab.questions = questions || lab.questions;
  lab.deadline = deadline !== undefined ? deadline : lab.deadline;
  lab.isVisible = isVisible !== undefined ? isVisible : lab.isVisible;

  await lab.save();

  res.status(200).json({
    success: true,
    message: "Lab updated successfully.",
    lab,
  });
});

export const getLabsForClass = catchAsyncError(async (req, res, next) => {
  const classId = req.params.classId;

  // Use a lightweight existence check instead of loading the full class with all students
  const isTeacher = !!(await Class.exists({ _id: classId, teacher: req.user._id }));
  const isStudent = !!(await Class.exists({ _id: classId, students: req.user._id }));
  const isAdmin = req.user.role === "Admin";

  if (!isTeacher && !isStudent && !isAdmin) {
    // Verify the class exists before returning 403 vs 404
    const exists = await Class.exists({ _id: classId });
    if (!exists) return next(new ErrorHandler("Class not found.", 404));
    return next(new ErrorHandler("Not authorized to view labs for this class.", 403));
  }

  let filter = { class_id: classId };
  if (!isTeacher && !isAdmin) {
    filter.isVisible = true; // Students only see visible labs
  }

  const labs = await Lab.find(filter)
    .populate("questions", "title difficulty slug")
    .lean();

  res.status(200).json({
    success: true,
    labs,
  });
});

export const getLabDetails = catchAsyncError(async (req, res, next) => {
  const labId = req.params.id;

  const lab = await Lab.findById(labId).populate("questions");

  if (!lab) {
    return next(new ErrorHandler("Lab not found.", 404));
  }

  const classDetails = await Class.findById(lab.class_id);

  const isTeacher = classDetails.teacher.toString() === req.user._id.toString();
  const isStudent = classDetails.students.some(
    (student) => student.toString() === req.user._id.toString()
  );

  if (!isTeacher && !isStudent && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to view this lab.", 403));
  }

  if (!isTeacher && !lab.isVisible && req.user.role !== "Admin") {
    return next(new ErrorHandler("This lab is not visible to students.", 403));
  }

  res.status(200).json({
    success: true,
    lab,
  });
});

export const getGradesForClass = catchAsyncError(async (req, res, next) => {
  const { classId } = req.params;
  const classDetails = await Class.findById(classId)
    .populate("students", "name email")
    .lean();
  if (!classDetails) return next(new ErrorHandler("Class not found.", 404));

  const isTeacher = classDetails.teacher.toString() === req.user._id.toString();
  if (!isTeacher && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized.", 403));
  }

  const labs = await Lab.find({ class_id: classId })
    .populate("questions", "title difficulty")
    .lean();

  const studentIds = classDetails.students.map((s) => s._id);
  const allProblemIds = [
    ...new Set(labs.flatMap((l) => l.questions.map((q) => q._id.toString()))),
  ];

  const submissions = await Submission.find({
    user_id: { $in: studentIds },
    problem_id: { $in: allProblemIds },
    class_id: classId,
  })
    .select("user_id problem_id lab_id status")
    .lean();

  const lookup = {};
  for (const sub of submissions) {
    const key = `${sub.user_id}:${sub.problem_id}:${sub.lab_id}`;
    if (!lookup[key] || sub.status === "Accepted") lookup[key] = sub.status;
  }

  return res.status(200).json({
    success: true,
    labs,
    students: classDetails.students,
    lookup,
  });
});

export const getDueSoonLabs = catchAsyncError(async (req, res, next) => {
  // 1. Get all classes the student is enrolled in (only fetch needed fields)
  const classes = await Class.find({ students: req.user._id })
    .select('_id name')
    .lean();
  const classIds = classes.map(c => c._id);

  // Create a mapping to easily attach class info
  const classMap = classes.reduce((acc, c) => {
    acc[c._id.toString()] = c.name;
    return acc;
  }, {});

  // 2. Find upcoming labs for those classes (only fetch fields we need)
  const labs = await Lab.find({
    class_id: { $in: classIds },
    isVisible: true,
    deadline: { $gte: new Date() }
  })
    .sort({ deadline: 1 })
    .limit(10)
    .select('_id title class_id deadline')
    .lean();

  // 3. Format the response
  const dueSoon = labs.map(lab => ({
    _id: lab._id,
    title: lab.title,
    course: classMap[lab.class_id.toString()],
    date: lab.deadline,
    class_id: lab.class_id,
  }));

  res.status(200).json({
    success: true,
    dueSoon
  });
});

export const getMyLabs = catchAsyncError(async (req, res, next) => {
  // 1. Get all classes the student is enrolled in
  const classes = await Class.find({ students: req.user._id }).select('_id name branch');
  const classIds = classes.map(c => c._id);
  
  const classMap = classes.reduce((acc, c) => {
    acc[c._id.toString()] = { name: c.name, branch: c.branch };
    return acc;
  }, {});

  // 2. Find all visible labs for those classes
  const labs = await Lab.find({
    class_id: { $in: classIds },
    isVisible: true,
  }).sort({ deadline: 1 });

  // 3. Find Accepted submissions for this user in these labs
  const submissions = await Submission.find({
    user_id: req.user._id,
    lab_id: { $in: labs.map(l => l._id) },
    status: "Accepted"
  }).select('lab_id problem_id').lean();

  const acceptedPerLab = {};
  submissions.forEach(sub => {
    if (!sub.lab_id) return;
    const labId = sub.lab_id.toString();
    if (!acceptedPerLab[labId]) {
      acceptedPerLab[labId] = new Set();
    }
    if (sub.problem_id) {
      acceptedPerLab[labId].add(sub.problem_id.toString());
    }
  });

  const now = new Date();

  // 4. Format the response
  const myLabs = labs.map(lab => {
    const numQuestions = lab.questions ? lab.questions.length : 0;
    const labIdStr = lab._id.toString();
    const acceptedCount = acceptedPerLab[labIdStr] ? acceptedPerLab[labIdStr].size : 0;

    const maxMarks = numQuestions * 10;
    const marksObtained = acceptedCount * 10;

    let status = "pending";
    if (numQuestions > 0 && acceptedCount === numQuestions) {
      status = "graded";
    } else if (lab.deadline && new Date(lab.deadline) < now) {
      status = "overdue";
    }

    return {
      id: lab._id,
      title: lab.title,
      courseCode: classMap[lab.class_id.toString()]?.branch || "N/A",
      courseName: classMap[lab.class_id.toString()]?.name || "Unknown Course",
      deadline: lab.deadline,
      maxMarks,
      marksObtained,
      status,
      class_id: lab.class_id
    };
  });

  res.status(200).json({
    success: true,
    labs: myLabs
  });
});

