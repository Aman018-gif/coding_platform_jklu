import express from "express";
import { getContests, getContestById, getContestBySlug, getActiveContest, getLeaderboard, createContest, updateContest, deleteContest, addProblemsToContest, registerForContest, getMyContests, getPresets, getContestSubmissions } from "../controllers/contestController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { endContest } from "../controllers/contestController.js";
const router = express.Router();

router.get("/slug/:slug", getContestBySlug);
router.get("/", getContests);
router.post("/", isAuthenticated, createContest);
router.put("/:id", isAuthenticated, updateContest);
router.delete("/:id", isAuthenticated, deleteContest);
router.get("/my", isAuthenticated, getMyContests);
router.get("/presets", getPresets);
router.get("/active", getActiveContest);
router.post("/:id/problems", isAuthenticated, addProblemsToContest);
router.put("/:id/register", isAuthenticated, registerForContest);
router.get("/:id/leaderboard", getLeaderboard);
router.get("/:id/submissions", isAuthenticated, getContestSubmissions);
router.get("/:id", getContestById);
router.post("/:id/end", isAuthenticated, endContest);

export default router;
