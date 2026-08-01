import mongoose from "mongoose";

const TagSchema = new mongoose.Schema(
  {
    tagName: {
      type: String,
      required: [true, "task name is a required field"],
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      trim: true,
    },
    createdBy: { type: String },
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

export const TagModel = mongoose.model("tags", TagSchema);
