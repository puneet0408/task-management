import express from "express";
import {
  getAllCompanies,
  createCompany,
  getCompanybyID,
  updateCompany,
  deleteCompany,
} from "./../controlers/companyColtroler.js";
import { authenticate, authorized } from "../middleware/auth.js";
const CompanyRoutes = express.Router();
CompanyRoutes.route("/")
  .get(authenticate, authorized, getAllCompanies)
  .post(authenticate, authorized, createCompany);
CompanyRoutes.route("/:id")
  .get(authenticate, authorized,getCompanybyID)
  .patch(authenticate, authorized, updateCompany)
  .delete(authenticate, authorized, deleteCompany);
export default CompanyRoutes;
