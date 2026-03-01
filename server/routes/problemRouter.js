import express from "express";
import { getProblems, getProblemById, createProblem } from "../controllers/problemController.js";

const router = express.Router();

router.get("/", getProblems);
router.post("/", createProblem);
router.get("/:id", getProblemById);

export default router;
