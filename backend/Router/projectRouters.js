import express from "express";
import {
  getAllProjects,
  createProject,
  UpdateProject,
  DeleteProject,
  markDefaultProject,
  markDefaultSprint,
  markLastPreferenceProject,
} from "./../controlers/projectContoller.js";
import { authenticate, authorized } from "../middleware/auth.js";
const ProjectRoutes = express.Router();
ProjectRoutes.route("/")
  .get(authenticate, authorized, getAllProjects)
  .post(authenticate, authorized, createProject);
ProjectRoutes.route("/:id")
  .patch(authenticate, authorized, UpdateProject)
  .delete(authenticate, authorized, DeleteProject);
  ProjectRoutes.route("/markdefaultsprint/:sprintId").patch(authenticate,authorized,markDefaultSprint);
  ProjectRoutes.route("/markdefaultproject/:projectId").patch(authenticate,authorized,markDefaultProject);
   ProjectRoutes.route("/lastPreferenceproject/:projectId").patch(authenticate,authorized,markLastPreferenceProject);
export default ProjectRoutes;
