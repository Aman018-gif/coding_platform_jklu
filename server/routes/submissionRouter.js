import express from "express";
import { runCode, submitCode, getSubmissions } from "../controllers/submissionController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/run", isAuthenticated, runCode);
router.post("/submit", isAuthenticated, submitCode);
router.get("/", isAuthenticated, getSubmissions);

export default router;
