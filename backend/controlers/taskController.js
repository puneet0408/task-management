import { TaskModel } from "../Model/taskModel.js";
import { NotificationModel } from "../Model/notification.js";
import mongoose from "mongoose";
import { getIO } from "../Socket/socket.js";
import nodemailer from "nodemailer";
import { ProjectModel } from "../Model/projectModel.js";
import { UsersModel } from "../Model/userModel.js";
export const getAllTask = async (req, res) => {
  try {
    const {
      limit,
      offset,
      sprintId,
      assignedTo,
      taskStatus,
      tag,
      priority,
      type,
      searchValue,
      sortFIeld,
      sortDirection,
      filter,
    } = req.query;

    const { loginUser } = req;
    if (!loginUser) {
      return res.status(401).json({
        data: {
          msg: "unothorized",
        },
      });
    }
    const projectId = loginUser?.preferences?.activeProject?.projectId;
    let taskFilters = { isDeleted: false };
    if (sprintId) {
      taskFilters.sprintId = new mongoose.Types.ObjectId(sprintId);
    }
    if (projectId) {
      taskFilters.projectId = new mongoose.Types.ObjectId(projectId);
    }
    if (filter === "unassignedTasks") {
      taskFilters.assignedTo = null;
    }
    if (filter === "todo") {
      taskFilters.taskStatus = "New";
    }
    if (filter === "openbug") {
      taskFilters.type = "bug";
      taskFilters.taskStatus = {
        $in: ["in_progress", "New"],
      };
    }
    if (filter === "closedbug") {
      taskFilters.type = "bug";
      taskFilters.taskStatus = {
        $nin: ["done", "closed"],
      };
    }
    if (filter === "overdue") {
      taskFilters.due_date = {
        $lt: new Date(),
      };
      taskFilters.taskStatus = {
        $nin: ["done", "closed"],
      };
    }
    if (assignedTo) {
      const assignedArray = Array.isArray(assignedTo)
        ? assignedTo
        : assignedTo.split(",");

      const assignedObjectIds = assignedArray.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      taskFilters.assignedTo = { $in: assignedObjectIds };
    }
    if (tag) {
      const tagArray = Array.isArray(tag) ? tag : tag.split(",");
      taskFilters.tags = { $in: tagArray };
    }
    if (taskStatus) {
      const statusArray = Array.isArray(taskStatus)
        ? taskStatus
        : taskStatus.split(",");
      taskFilters.taskStatus = { $in: statusArray };
    }
    if (priority) {
      const priorityArray = Array.isArray(priority)
        ? priority
        : priority.split(",");
      taskFilters.priority = { $in: priorityArray };
    }
    if (type) {
      const typeArray = Array.isArray(type) ? type : type.split(",");
      taskFilters.type = { $in: typeArray };
    }
    let matchStage = taskFilters;
    if (!filter) {
      matchStage = {
        $or: [
          {
            type: "story",
            isDeleted: false,
            projectId: new mongoose.Types.ObjectId(projectId),
          },
          taskFilters,
        ],
      };
    }
    if (searchValue) {
      matchStage.$and = [
        {
          $or: [
            { title: { $regex: searchValue, $options: "i" } },
            { description: { $regex: searchValue, $options: "i" } },
          ],
        },
      ];
    }
    const sortStage = sortFIeld
      ? { [sortFIeld]: sortDirection === "asc" ? 1 : -1 }
      : { createdAt: -1 };
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: matchStage },
      { $sort: sortStage },
      { $skip: Number(offset) || 0 },
      {
        $project: {
          title: 1,
          sprintId: 1,
          parentId: 1,
          description: 1,
          taskStatus: 1,
          attachment: 1,
          type: 1,
          assignedTo: 1,
          tags: 1,
          originalTIme: 1,
          RemainingTIme: 1,
          CompleteTIme: 1,
          priority: 1,
          isDeleted: 1,
          "user.name": 1,
          "user._id": 1,
          createdBy: 1,
          updatedAt: 1,
          subtasks: 1,
          comments: 1,
          due_date: 1,
          taskId: 1,
        },
      },
      ...(limit ? [{ $limit: Number(limit) }] : []),
    ];
    const tasks = await TaskModel.aggregate(pipeline);
    return res.status(200).json({
      status: "success",
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { loginUser } = req;
    if (!loginUser) {
      return res.status(401).json({
        data: {
          msg: "unothorized",
        },
      });
    }
    const companyId = loginUser?.company_name;
    const projectId = loginUser?.preferences?.activeProject?.projectId;
    const createdBy = loginUser?._id;
    const {
      title,
      parentId,
      sprintId,
      description,
      taskStatus,
      stage,
      type,
      assignedTo,
      tags,
      originalTIme,
      RemainingTIme,
      CompleteTIme,
      priority,
      completedAt,
      attachment,
      subtasks,
      comments,
      due_date,
    } = req.body;
    if (!companyId) {
      return res.status(400).json({
        data: {
          msg: "company is required",
        },
      });
    }
    if (!projectId) {
      return res.status(400).json({
        data: {
          msg: "project is required",
        },
      });
    }
    const projectDetails = await ProjectModel.findById(projectId);
    let updatetaskCounterinproject = {
      ...projectDetails,
      taskCounter: projectDetails?.taskCounter + 1,
    };
    console.log(updatetaskCounterinproject, "updatetaskCounterinproject");
    const payload = {
      taskId: updatetaskCounterinproject?.taskCounter,
      title,
      companyId,
      projectId,
      parentId,
      sprintId,
      description,
      taskStatus,
      stage,
      type,
      attachment,
      subtasks,
      assignedTo: assignedTo,
      tags,
      originalTIme,
      RemainingTIme,
      CompleteTIme,
      priority,
      completedAt,
      createdBy,
      comments,
      due_date,
    };
    let commingComment = comments;
    let latestComment = new Array();
    for (let i = 0; i < commingComment.length; i++) {
      if (!commingComment[i]._id) {
        latestComment.push(commingComment[i]);
      }
    }
    for (let i = 0; i < latestComment.length; i++) {
      const comment = latestComment[i];
      if (comment.mentionedUserIds?.length) {
        for (let j = 0; j < comment.mentionedUserIds.length; j++) {
          const userId = comment.mentionedUserIds[j];
          const getuser = await UsersModel.findById(userId);
          if (!getuser) continue;
          console.log(getuser, "getuser");
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: `"My App" <${process.env.EMAIL_USER}>`,
            to: getuser.email,
            subject: "You were mentioned in a task comment",
            html: `
          <div style="font-family: Arial;">
            <h2>Hello ${getuser.name}</h2>
            <p>You were mentioned in a task comment.</p>
            <p><strong>Comment:</strong> ${comment.text}</p>
          </div>
        `,
          });
        }
      }
    }
    return;
    const task = await TaskModel.create(payload);
    if (task.assignedTo) {
      const notification = await NotificationModel.create({
        userId: task.assignedTo,
        title: "Task Assigned",
        message: `You were assigned task ${task.title}`,
        type: "TASK_ASSIGNED",
      });
      const io = getIO();
      io.to(task.assignedTo.toString()).emit("newNotification", notification);
    }
    res.status(201).json({
      task,
      status: 201,
      msg: "task created sucessfully",
    });
  } catch (error) {
    res.status(400).json({
      error,
      status: 400,
      msg: "Internal server error",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const id = req.params.id;
    let commingComment = req?.body?.comments;
    let latestComment = new Array();
    for (let i = 0; i < commingComment.length; i++) {
      if (!commingComment[i]._id) {
        latestComment.push(commingComment[i]);
      }
    }
    for (let i = 0; i < latestComment.length; i++) {
      const comment = latestComment[i];
      if (comment.mentionedUserIds?.length) {
        for (let j = 0; j < comment.mentionedUserIds.length; j++) {
          const userId = comment.mentionedUserIds[j];
          const getuser = await UsersModel.findById(userId);
          if (!getuser) continue;
          console.log(getuser, "getuser");
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: `"My App" <${process.env.EMAIL_USER}>`,
            to: getuser.email,
            subject: "You were mentioned in a task comment",
            html: `
          <div style="font-family: Arial;">
            <h2>Hello ${getuser.name}</h2>
            <p>You were mentioned in a task comment.</p>
            <p><strong>Comment:</strong> ${comment.text}</p>
          </div>
        `,
          });
        }
      }
    }
    const updateData = await TaskModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
        if (updateData.assignedTo) {
      const notification = await NotificationModel.create({
        userId: updateData.assignedTo,
        title: "Task Update",
        message: `Update ON task ${updateData.title}`,
        type: "TASK_UPDATED",
      });
      console.log(notification,"notification");
      
      const io = getIO();
      io.to(updateData.assignedTo.toString()).emit("newNotification", notification);
    }
    res.status(200).json({
      status: "success",
      data: {
        updateData,
        status: 201,
        msg: "data get poperly",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};

export const DeleteTask = async (req, res) => {
  try {
    const id = req.params.id;
    await TaskModel.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        msg: "task Deleted Sucessfully",
      },
    });
  } catch (error) {
    res.status(401).json({
      status: "Failed",
      data: {
        msg: "Internal server error",
      },
    });
  }
};

export const getDeletedTask = async (req, res) => {
  try {
    const {
      limit,
      offset,
      tag,
      priority,
      type,
      searchValue,
      sortFIeld,
      sortDirection,
      filter,
      assignedTo,
      taskStatus
    } = req.query;
console.log("deleted task");

    const { loginUser } = req;
    if (!loginUser) {
      return res.status(401).json({
        data: {
          msg: "unothorized",
        },
      });
    }
    const projectId = loginUser?.preferences?.activeProject?.projectId;
     const sprintId = loginUser?.preferences?.Activesprint?.sprintId;
    
    let taskFilters = { isDeleted: true };
    if (sprintId) {
      taskFilters.sprintId = new mongoose.Types.ObjectId(sprintId);
    }
    if (projectId) {
      taskFilters.projectId = new mongoose.Types.ObjectId(projectId);
    }
    if (filter === "unassignedTasks") {
      taskFilters.assignedTo = null;
    }
    if (filter === "todo") {
      taskFilters.taskStatus = "New";
    }
    if (filter === "openbug") {
      taskFilters.type = "bug";
      taskFilters.taskStatus = {
        $in: ["in_progress", "New"],
      };
    }
    if (filter === "closedbug") {
      taskFilters.type = "bug";
      taskFilters.taskStatus = {
        $nin: ["done", "closed"],
      };
    }
    if (filter === "overdue") {
      taskFilters.due_date = {
        $lt: new Date(),
      };
      taskFilters.taskStatus = {
        $nin: ["done", "closed"],
      };
    }
    if (assignedTo) {
      const assignedArray = Array.isArray(assignedTo)
        ? assignedTo
        : assignedTo.split(",");

      const assignedObjectIds = assignedArray.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      taskFilters.assignedTo = { $in: assignedObjectIds };
    }
    if (tag) {
      const tagArray = Array.isArray(tag) ? tag : tag.split(",");
      taskFilters.tags = { $in: tagArray };
    }
    if (taskStatus) {
      const statusArray = Array.isArray(taskStatus)
        ? taskStatus
        : taskStatus.split(",");
      taskFilters.taskStatus = { $in: statusArray };
    }
    if (priority) {
      const priorityArray = Array.isArray(priority)
        ? priority
        : priority.split(",");
      taskFilters.priority = { $in: priorityArray };
    }
    if (type) {
      const typeArray = Array.isArray(type) ? type : type.split(",");
      taskFilters.type = { $in: typeArray };
    }
    let matchStage = taskFilters;
    if (searchValue) {
      matchStage.$and = [
        {
          $or: [
            { title: { $regex: searchValue, $options: "i" } },
            { description: { $regex: searchValue, $options: "i" } },
          ],
        },
      ];
    }
    const sortStage = sortFIeld
      ? { [sortFIeld]: sortDirection === "asc" ? 1 : -1 }
      : { createdAt: -1 };
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: matchStage },
      { $sort: sortStage },
      { $skip: Number(offset) || 0 },
      {
        $project: {
          title: 1,
          sprintId: 1,
          parentId: 1,
          description: 1,
          taskStatus: 1,
          attachment: 1,
          type: 1,
          assignedTo: 1,
          tags: 1,
          originalTIme: 1,
          RemainingTIme: 1,
          CompleteTIme: 1,
          priority: 1,
          isDeleted: 1,
          "user.name": 1,
          "user._id": 1,
          createdBy: 1,
          updatedAt: 1,
          subtasks: 1,
          comments: 1,
          due_date: 1,
          taskId: 1,
        },
      },
      ...(limit ? [{ $limit: Number(limit) }] : []),
    ];
    const tasks = await TaskModel.aggregate(pipeline);
    return res.status(200).json({
      status: "success",
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
