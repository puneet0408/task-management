import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema(
  {
    sprintName: {
      type: String,
      required: [true, "Sprint name is a required field"],
      trim: true,
    },
    companyId: {
      type: String,
      trim: true,
    },
    projectId: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    createdBy: { type: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const SprintModel = mongoose.model("Sprint", sprintSchema);
