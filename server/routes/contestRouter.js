import express from "express";
import { getContests, getContestById, getActiveContest, getLeaderboard, createContest } from "../controllers/contestController.js";

const router = express.Router();

router.get("/", getContests);
router.post("/", createContest);
router.get("/active", getActiveContest);
router.get("/:id/leaderboard", getLeaderboard);
router.get("/:id", getContestById);

export default router;
