import express from "express";
import { getContests, getContestById, getActiveContest, getLeaderboard, createContest, registerForContest, getContestSubmissions } from "../controllers/contestController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { endContest } from "../controllers/contestController.js";
const router = express.Router();

router.get("/", getContests);
router.post("/", createContest);
router.get("/active", getActiveContest);
router.put("/:id/register", isAuthenticated, registerForContest);
router.get("/:id/leaderboard", getLeaderboard);
router.get("/:id/submissions", isAuthenticated, getContestSubmissions);
router.get("/:id", getContestById);
router.post("/:id/end", isAuthenticated, endContest);

export default router;
