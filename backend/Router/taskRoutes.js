import express from "express";
import {
  getAllTask,
  createTask,
  updateTask,
  DeleteTask,
  getDeletedTask,
} from "./../controlers/taskController.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.middleware.js";
import { authenticate, authorized } from "../middleware/auth.js";
const TaskRoutes = express.Router();
TaskRoutes.route("/")
  .get(authenticate, rateLimitMiddleware("tasks", 100, 60), authorized, getAllTask)
  .post(authenticate, authorized, createTask);
TaskRoutes.route("/:id")
  .patch(authenticate, authorized, updateTask)
  .delete(authenticate, authorized, DeleteTask);
TaskRoutes.route("/deletedtask").get(
  authenticate,
  authorized,
  getDeletedTask
);
export default TaskRoutes;
