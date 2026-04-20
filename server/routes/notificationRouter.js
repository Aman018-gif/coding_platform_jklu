import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  getUserNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", isAuthenticated, getUserNotifications);
router.put("/read-all", isAuthenticated, markAllAsRead);
router.put("/:id/read", isAuthenticated, markAsRead);

export default router;
