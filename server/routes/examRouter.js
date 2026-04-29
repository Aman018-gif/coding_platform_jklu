import express from "express";
import {
  getExams, getExamById, getExamBySlug, createExam, updateExam, deleteExam,
  addProblemsToExam, registerForExam, getMyExams, getExamsForClass,
} from "../controllers/examController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getExams);
router.get("/my", isAuthenticated, getMyExams);
router.get("/class/:classId", isAuthenticated, getExamsForClass);
router.get("/slug/:slug", getExamBySlug);
router.post("/", isAuthenticated, authorizeRoles("Teacher", "Admin"), createExam);
router.put("/:id", isAuthenticated, updateExam);
router.delete("/:id", isAuthenticated, deleteExam);
router.post("/:id/problems", isAuthenticated, addProblemsToExam);
router.put("/:id/register", isAuthenticated, registerForExam);
router.get("/:id", getExamById);

export default router;
