import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";
import contestRouter from "./routes/contestRouter.js";
import problemRouter from "./routes/problemRouter.js";
import submissionRouter from "./routes/submissionRouter.js";
import classRouter from "./routes/classRouter.js";
import labRouter from "./routes/labRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import adminRouter from "./routes/adminRouter.js";
import announcementRouter from "./routes/announcementRouter.js";
import noteRouter from "./routes/noteRoutes.js";
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";
import { startBadgeCron } from "./automation/badgeCron.js";
import examRouter from "./routes/examRouter.js";
export const app = express();
config({ path: "./config.env" });

// Trust the first proxy hop so req.ip reads X-Forwarded-For correctly
// when behind Nginx, a load balancer, or any reverse proxy.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/contests", contestRouter);
app.use("/api/v1/problems", problemRouter);
app.use("/api/v1/submissions", submissionRouter);
app.use("/api/v1/classes", classRouter);
app.use("/api/v1/labs", labRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/announcements", announcementRouter);
app.use("/api/v1/exams", examRouter);
app.use("/api/v1/notes", noteRouter);

removeUnverifiedAccounts();
connection();
startBadgeCron();
 
app.use(errorMiddleware);
