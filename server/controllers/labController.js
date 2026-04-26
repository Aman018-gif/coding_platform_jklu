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

  const classDetails = await Class.findById(classId);

  if (!classDetails) {
    return next(new ErrorHandler("Class not found.", 404));
  }

  const isTeacher = classDetails.teacher.toString() === req.user._id.toString();
  const isStudent = classDetails.students.some(
    (student) => student.toString() === req.user._id.toString()
  );

  if (!isTeacher && !isStudent && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to view labs for this class.", 403));
  }

  let filter = { class_id: classId };
  if (!isTeacher && req.user.role !== "Admin") {
    filter.isVisible = true; // Students only see visible labs
  }

  const labs = await Lab.find(filter).populate("questions", "title difficulty slug");

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
