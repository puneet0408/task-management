import TaskActivityMOdel from "../Model/activityModel.js";
import mongoose from "mongoose";

export const getAllActivity = async (req, res) => {
  try {
    const { taskId, limit, offset } = req.query;

    if (!taskId) {
      return res.status(400).json({
        status: "fail",
        msg: "taskid is required",
      });
    }

    const data = await TaskActivityMOdel.find({
     taskId: new mongoose.Types.ObjectId(taskId), 
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset || 0);

    res.status(200).json({
      status: "success",
      length: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      msg: err.message,
    });
  }
};
export const getActivityID = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await TaskActivityMOdel.findById(id);

    if (!activity) {
      return res.status(404).json({
        status: "fail",
        msg: "Activity not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: activity,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      msg: err.message,
    });
  }
};

export const createActivity = async (req, res) => {
  try {
    const { loginUser } = req;

    const userId = loginUser?._id;
    const projectId = loginUser?.preferences?.activeProject?.projectId;

    const { taskId, action, changes, message } = req.body;

    if (!projectId || !userId) {
      return res.status(401).json({
        status: "fail",
        msg: "Unauthorized",
      });
    }

    if (!taskId || !action) {
      return res.status(400).json({
        status: "fail",
        msg: "taskId and action are required",
      });
    }

    const payload = {
      taskId,
      action,
      changes,
      message,
      userId,
      projectId,
    };

    const activity = await TaskActivityMOdel.create(payload);

    res.status(201).json({
      status: "success",
      data: activity,
      msg: "Activity created successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      msg: err.message,
    });
  }
};
