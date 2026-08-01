import express from "express";
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  gettagID,
} from "./../controlers/tagController.js";
import { authenticate, authorized } from "../middleware/auth.js";
const TagRoutes = express.Router();
TagRoutes.route("/")
  .get(authenticate, authorized, getAllTags)
  .post(authenticate, authorized, createTag);
TagRoutes.route("/:id")
  .get(authenticate, authorized, gettagID)
  .patch(authenticate, authorized, updateTag)
  .delete(authenticate, authorized, deleteTag);
export default TagRoutes;
