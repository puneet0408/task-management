import express from "express";
import {
  getAllSprint,
  createSprint,
  UpdateSprint,
  DeleteSprint,
} from "./../controlers/sprintController.js";
import { authenticate, authorized } from "../middleware/auth.js";
const SprintRoutes = express.Router();
SprintRoutes.route("/")
  .get(authenticate, authorized, getAllSprint)
  .post(authenticate, authorized, createSprint);
SprintRoutes.route("/:id")
  .patch(authenticate, authorized, UpdateSprint)
  .delete(authenticate, authorized, DeleteSprint);
export default SprintRoutes;
