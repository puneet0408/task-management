import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    changes: [
      {
        type: {
          type: String,
          required: true,
        },
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        text: String,
        meta: mongoose.Schema.Types.Mixed
      }
    ],

    message: {
      type: String,
    }
  },
  { timestamps: true }
);

export default mongoose.model("taskactivitylogs", ActivitySchema);