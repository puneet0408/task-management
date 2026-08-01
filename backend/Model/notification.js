import mongoose from "mongoose";

const NotificationSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },

      title: String,

      message: String,

      isRead: {
        type: Boolean,
        default: false,
      },

      type: String,
    },
    {
      timestamps: true,
    }
  );

export const NotificationModel =
  mongoose.model(
    "notifications",
    NotificationSchema
  );