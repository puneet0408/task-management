import express from "express";

import { getprojectSummaryWidgets , getAdminSummaryWidgets } from "../controlers/dashboardController.js";

import { authenticate, authorized } from "../middleware/auth.js";
const dashboardRoutes = express.Router();
dashboardRoutes
  .route("/summaryemp")
  .get(authenticate, authorized, getprojectSummaryWidgets);
  dashboardRoutes
  .route("/summaryadmin")
  .get(authenticate, authorized, getAdminSummaryWidgets);
export default dashboardRoutes;
