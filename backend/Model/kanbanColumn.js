import mongoose from "mongoose";

const KanbanColumnSchema = new mongoose.Schema(
  {
    columnName: {
      type: String,
      required: [true, "task name is a required field"],
      trim: true,
    },
    taskStage: {
      type: String,
      required: [true, "stage is a required field"],
      trim: true,
    },
    bugStage: {
      type: String,
      trim: true,
    },
        order: {
      type: Number
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      trim: true,
    },
    createdBy: { type: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const KanbanColumnModel = mongoose.model("kanbanColumn", KanbanColumnSchema);
