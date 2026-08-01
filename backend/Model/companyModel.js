import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: [true, "Company name is a required field"],
      unique: true,
      trim: true,
    },
    owner_name: {
      type: String,
      required: [true, "Owner name is a required field"],
    },
    email: {
      type: String,
      required: [true, "Email is a required field"],
      unique: true,
      lowercase: true,
    },
    limit: {
      maxUsers: Number,
      maxProjects: Number,
    },
    usage: {
      usersCount: Number,
      projectsCount: Number,
    },
    address: {
      type: String,
    },
    contact_no: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const CompanyModel = mongoose.model("Company", companySchema);
