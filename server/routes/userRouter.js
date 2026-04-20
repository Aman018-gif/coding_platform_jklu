import express from "express";
import {
  register,
  verifyOTP,
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
  upgradeToTeacher,
  getStudentsByGroup,
  searchUsers,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/otp-verification", verifyOTP);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.get("/students", getStudentsByGroup);
router.get("/search", searchUsers);
router.get("/profile", isAuthenticated, getProfile);
router.put("/profile", isAuthenticated, updateProfile);

// temporary endpoint
router.post("/upgrade-to-teacher", isAuthenticated, upgradeToTeacher);

export default router;
