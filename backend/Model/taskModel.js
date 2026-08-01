import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "task name is a required field"],
      trim: true,
    },
    taskId: {
      type: Number,
      required: [true, "task Id is required"],
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: [true, "Company name is a required field"],
      trim: true,
    },
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sprints",
      required: [true, "Sprint name is a required field"],
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: [true, "project name is a required field"],
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    taskStatus: {
      type: String,
      default: "new",
    },
    type: {
      type: String,
      enum: ["bug", "task", "story"],
      default: "task",
    },
    due_date: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    tags: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    attachment: [
      {
        name: { type: String, trim: true },
        type: { type: String, trim: true },
        url: { type: String, trim: true },
      },
    ],
    subtasks: [
      {
        title: { type: String, trim: true },
        completed: { type: Boolean },
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        authorName: {
          type: String,
        },
        text: String,
         mentionedUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    originalTIme: {
      type: Number,
    },
    RemainingTIme: {
      type: Number,
    },
    CompleteTIme: {
      type: Number,
    },
    priority: {
      type: String,
    },
    createdBy: { type: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model("tasks", TaskSchema);
