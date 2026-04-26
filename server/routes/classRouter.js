import express from "express";
import {
  createClass,
  getClasses,
  getClassDetails,
  toggleJoinStatus,
  joinClass,
  removeStudent,
  addStudentByEmail,
} from "../controllers/classController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Teacher routes
router.post("/create", isAuthenticated, authorizeRoles("Teacher", "Admin"), createClass);
router.patch("/:id/toggle-join", isAuthenticated, authorizeRoles("Teacher", "Admin"), toggleJoinStatus);
router.delete("/:classId/student/:studentId", isAuthenticated, authorizeRoles("Teacher", "Admin"), removeStudent);
router.post("/:classId/add-student", isAuthenticated, authorizeRoles("Teacher", "Admin"), addStudentByEmail);

// Student routes
router.post("/join", isAuthenticated, authorizeRoles("Student"), joinClass);

// Shared routes
router.get("/", isAuthenticated, getClasses);
router.get("/:id", isAuthenticated, getClassDetails);

export default router;
