import express from "express";
import { getContests, getContestById, getContestBySlug, getActiveContest, getLeaderboard, createContest, updateContest, deleteContest, addProblemsToContest, registerForContest, getMyContests, getPresets, getContestSubmissions, getMergedLeaderboard } from "../controllers/contestController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import { endContest } from "../controllers/contestController.js";
const router = express.Router();

router.get("/slug/:slug", getContestBySlug);
router.get("/", getContests);
router.post("/", isAuthenticated, authorizeRoles("Teacher", "Admin", "TA"), createContest);
router.put("/:id", isAuthenticated, authorizeRoles("Teacher", "Admin", "TA"), updateContest);
router.delete("/:id", isAuthenticated, authorizeRoles("Teacher", "Admin", "TA"), deleteContest);
router.get("/my", isAuthenticated, getMyContests);
router.get("/presets", getPresets);
router.get("/active", getActiveContest);
// Merged leaderboard — must be before /:id routes to avoid conflict
router.post("/merged-leaderboard", isAuthenticated, getMergedLeaderboard);
router.post("/:id/problems", isAuthenticated, authorizeRoles("Teacher", "Admin", "TA"), addProblemsToContest);
router.put("/:id/register", isAuthenticated, registerForContest);
router.get("/:id/leaderboard", getLeaderboard);
router.get("/:id/submissions", isAuthenticated, getContestSubmissions);
router.get("/:id", getContestById);
router.post("/:id/end", isAuthenticated, authorizeRoles("Teacher", "Admin", "TA"), endContest);

export default router;
