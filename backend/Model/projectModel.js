import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is a required field"],
      trim: true,
    },
    taskCounter:{
      type:Number,
      default:0,
    },
    companyId: {
      type: String,
      required: [true, "Company name is a required field"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isDefault:Boolean,
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    createdBy: {type: String},
      isdefault: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
projectSchema.index({
  project_name: "text",
  description: "text"
});

export const ProjectModel = mongoose.model("project", projectSchema);
