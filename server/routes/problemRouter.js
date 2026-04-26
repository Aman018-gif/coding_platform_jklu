import express from "express";
import { getProblems, getProblemById, createProblem, updateProblem, deleteProblem } from "../controllers/problemController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getProblems);
router.post("/", isAuthenticated, authorizeRoles("Teacher", "Admin", "TA"), createProblem);
router.get("/:id", getProblemById);
router.put("/:id", isAuthenticated, authorizeRoles("Teacher", "Admin"), updateProblem);
router.delete("/:id", isAuthenticated, authorizeRoles("Admin"), deleteProblem);

export default router;
