import { NotificationModel } from "../Model/notification.js";

import { getIO } from "../Socket/socket.js";

export const getAllNotification = async (req, res) => {
  try {
    const { loginUser } = req;
    if (!loginUser?.preferences?.activeProject?.projectId) {
      return res.status(401).json({
        status: "fail",
        msg: "Unauthorized login",
      });
    }
    const notification = await NotificationModel.find({
      userId: loginUser._id,
    }).sort({ createdAt: -1 });
    res.status(200).json({
      status: 200,
      notification,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, isRead } = req.body;

    if (!userId) {
      return res.status(400).json({
        msg: "UserId is required",
      });
    }

    const notification = await NotificationModel.create({
      userId,
      title,
      message,
      isRead,
    });
    const io = getIO();
    io.to(userId.toString()).emit("notification", {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });
    res.status(200).json({
      status: "Success",
      data: {
        notification,
        msg: "Notification Created Successfully",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Fail",
      msg: err.message,
    });
  }
};

export const ReadNotification = async (req, res) => {
  try {
    const { loginUser } = req;

    if (!loginUser?.preferences?.activeProject?.projectId) {
      return res.status(401).json({
        status: "fail",
        msg: "Unauthorized login",
      });
    }

    const { notificationId } = req.body;

    let result;

    if (notificationId === "all") {
      result = await NotificationModel.updateMany(
        { userId: loginUser._id, isRead: false },
        { $set: { isRead: true } }
      );
    } else {
      result = await NotificationModel.findOneAndUpdate(
        {
          _id: notificationId,
          userId: loginUser._id,
        },
        {
          $set: { isRead: true },
        },
        {
          new: true,
        }
      );
    }
    res.status(200).json({
      status: "success",
      data: result,
      msg: "Notification marked as read successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      msg: error.message,
    });
  }
};
