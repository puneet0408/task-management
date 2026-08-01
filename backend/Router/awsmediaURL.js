import express from "express";
import { createPresignedUrlWithClient,getPresignedViewUrl } from "../controlers/awsmediaupload.js";
import { authenticate, authorized } from "../middleware/auth.js";

const AwsUploadRoutes = express.Router();

AwsUploadRoutes.post(
  "/",
  authenticate,
  authorized,
  createPresignedUrlWithClient
);
AwsUploadRoutes.route("/:id")
  .get(authenticate, authorized,getPresignedViewUrl)

export default AwsUploadRoutes;