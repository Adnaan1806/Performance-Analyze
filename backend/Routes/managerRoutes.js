import express from "express";
import {
  getPendingLogs,
  approveLog,
  rejectLog,
  getAllEmployees,
  filterApprovedLogs,
  getLogStats
} from "../Controller/ManagerController.js";
import protect from "../middleware/auth.js";

const managerRouter = express.Router();

managerRouter.get("/pending-logs", protect, getPendingLogs);
managerRouter.put("/approve/:id", protect, approveLog);
managerRouter.put("/reject/:id", protect, rejectLog);
managerRouter.get("/employees", protect, getAllEmployees)
managerRouter.get("/stats", getLogStats)
managerRouter.get("/logs/filter", protect, filterApprovedLogs);

export default managerRouter;
