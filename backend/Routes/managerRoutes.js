import express from "express";
import {
  getPendingLogs,
  approveLog,
  rejectLog,
} from "../Controller/ManagerController.js";
import protect from "../middleware/auth.js";

const managerRouter = express.Router();

managerRouter.get("/pending-logs", protect, getPendingLogs);
managerRouter.put("/approve/:id", protect, approveLog);
managerRouter.put("/reject/:id", protect, rejectLog);

export default managerRouter;
