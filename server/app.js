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
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";
import { startBadgeCron } from "./automation/badgeCron.js";
export const app = express();
config({ path: "./config.env" });

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/contests", contestRouter);
app.use("/api/v1/problems", problemRouter);
app.use("/api/v1/submissions", submissionRouter);
app.use("/api/v1/classes", classRouter);
app.use("/api/v1/labs", labRouter);
app.use("/api/v1/notifications", notificationRouter);

removeUnverifiedAccounts();
connection();
startBadgeCron();
 
app.use(errorMiddleware);
