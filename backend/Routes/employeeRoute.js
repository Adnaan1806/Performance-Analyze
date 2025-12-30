import express from "express";
import { addDailyLog, getDailyLogs } from "../Controller/EmployeeController.js";
import protect from "../middleware/auth.js";

const employeeRouter = express.Router();

employeeRouter.post("/daily-log", protect, addDailyLog);
employeeRouter.get("/my-logs", protect, getDailyLogs);


export default employeeRouter;
