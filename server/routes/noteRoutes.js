import express from "express";
import {
  getUserNotes,
  getNoteByProblem,
  saveNote,
  deleteNote,
  clearNoteByProblem,
} from "../controllers/noteController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getUserNotes);
router.get("/problem/:problemId", getNoteByProblem);
router.post("/problem/:problemId", saveNote);
router.delete("/problem/:problemId", clearNoteByProblem);
router.delete("/:id", deleteNote);

export default router;
