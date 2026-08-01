import express from "express";
import {
  getAllNotification,
  createNotification,
  ReadNotification
} from "./../controlers/notffication.js";
import { authenticate, authorized } from "../middleware/auth.js";
const NotificationRoutes = express.Router();
NotificationRoutes.route("/")
  .get(authenticate, authorized, getAllNotification)
  .post(authenticate, authorized, createNotification);
 NotificationRoutes.route("/read").patch(authenticate,authorized,ReadNotification);
export default NotificationRoutes;