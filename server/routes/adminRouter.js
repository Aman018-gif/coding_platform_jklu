import express from "express";
import {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllClasses,
  getAllContests,
  getContestIpLogs,
  getWhitelist,
  addToWhitelist,
  removeFromWhitelist,
} from "../controllers/adminController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.use(isAuthenticated, authorizeRoles("Admin"));

router.get("/stats", getPlatformStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/classes", getAllClasses);
router.get("/contests", getAllContests);
router.get("/contests/:id/ip-logs", getContestIpLogs);

router.get("/whitelist", getWhitelist);
router.post("/whitelist", addToWhitelist);
router.delete("/whitelist/:id", removeFromWhitelist);

export default router;
