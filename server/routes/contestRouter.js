import express from "express";
import { getContests, getContestById, getActiveContest, getLeaderboard, createContest, registerForContest } from "../controllers/contestController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getContests);
router.post("/", createContest);
router.get("/active", getActiveContest);
router.put("/:id/register", isAuthenticated, registerForContest);
router.get("/:id/leaderboard", getLeaderboard);
router.get("/:id", getContestById);

export default router;
