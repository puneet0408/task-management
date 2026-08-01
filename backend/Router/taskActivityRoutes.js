import express from "express";
import {
  getAllActivity,
  createActivity,
  getActivityID,
} from "../controlers/taskactivitylog.js";
import { authenticate, authorized } from "../middleware/auth.js";
const TaskActivityRoutes = express.Router();
TaskActivityRoutes.route("/")
  .get(authenticate, authorized, getAllActivity)
  .post(authenticate, authorized, createActivity);
TaskActivityRoutes.route("/:id").get(authenticate, authorized, getActivityID);
export default TaskActivityRoutes;
