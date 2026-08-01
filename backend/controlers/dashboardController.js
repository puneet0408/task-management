import { TaskModel } from "../Model/taskModel.js";
import { ProjectModel } from "../Model/projectModel.js";
import { SprintModel } from "../Model/sprintModel.js";
import { UsersModel } from "../Model/userModel.js";
import mongoose from "mongoose";
import { LocationInfo$ } from "@aws-sdk/client-s3";

export const getprojectSummaryWidgets = async (req, res) => {
  try {
    const { loginUser } = req;
    if (!loginUser) {
      return res.status(401).json({
        status: "fail",
        msg: "Unauthorized",
      });
    }

    const { sprintId } = req.query;
    const projectId = loginUser?.preferences?.activeProject?.projectId;

    let matchStage = {
      isDeleted: false,
    };

    if (sprintId) {
      matchStage.sprintId = new mongoose.Types.ObjectId(sprintId);
    }
    if (projectId) {
      matchStage.projectId = new mongoose.Types.ObjectId(projectId);
    }
    // const pipeline = [
    //   { $match: matchStage },

    //   {
    //     $group: {
    //       _id: null,
    //       total: { $sum: 1 },
    //       done: { $sum: { $cond: [{ $eq: ["$taskStatus", "done"] }, 1, 0] } },
    //       todo: { $sum: { $cond: [{ $eq: ["$taskStatus", "New"] }, 1, 0] } },
    //       inProgress: {
    //         $sum: { $cond: [{ $eq: ["$taskStatus", "in_progress"] }, 1, 0] },
    //       },
    //       in_qa: {
    //         $sum: { $cond: [{ $eq: ["$taskStatus", "qa"] }, 1, 0] },
    //       },
    //       live: {
    //         $sum: { $cond: [{ $eq: ["$taskStatus", "live"] }, 1, 0] },
    //       },
    //       closed: {
    //         $sum: { $cond: [{ $eq: ["$taskStatus", "closed"] }, 1, 0] },
    //       },
    //       unassignedTasks: {
    //         $sum: { $cond: [{ $eq: ["$assignedTo", null] }, 1, 0] },
    //       },
    //       overdueTasks: {
    //         $sum: {
    //           $cond: [
    //             {
    //               $and: [
    //                 { $ne: ["$taskStatus", "done"] },
    //                 { $ne: ["$taskStatus", "closed"] },
    //                 { $lt: ["$due_date", new Date()] },
    //                 { $ne: ["$due_date", null] },
    //               ],
    //             },
    //             1,
    //             0,
    //           ],
    //         },
    //       },
    //       taskcount: { $sum: { $cond: [{ $eq: ["$type", "task"] }, 1, 0] } },
    //       bugcount: { $sum: { $cond: [{ $eq: ["$type", "bug"] }, 1, 0] } },
    //       storycount: { $sum: { $cond: [{ $eq: ["$type", "story"] }, 1, 0] } },
    //       highprority: { $sum: { $cond: [{ $eq: ["$priority", "1"] }, 1, 0] } },
    //       mediumprority: { $sum: { $cond: [{ $eq: ["$priority", "2"] }, 1, 0] } },
    //       lowprority: { $sum: { $cond: [{ $eq: ["$priority", "3"] }, 1, 0] } },
    //       totalorignalestimate: { $sum: "$originalTIme" },
    //       totalPending: { $sum: "$RemainingTIme" },
    //       totalComplete: { $sum: "$CompleteTIme" },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       total: 1,
    //       done: 1,
    //       todo: 1,
    //       inProgress: 1,
    //       in_qa: 1,
    //       closed: 1,
    //       live: 1,
    //       unassignedTasks:1,
    //       overdueTasks:1,
    //       taskcount:1,
    //       bugcount:1,
    //       storycount:1,
    //       highprority:1,
    //       mediumprority:1,
    //       lowprority:1,
    //       totalorignalestimate:1,
    //       totalPending:1,
    //       totalComplete:1
    //     },
    //   },
    // ];
    const pipeline = [
      {
        $match: matchStage,
      },

      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,

                total: { $sum: 1 },

                done: {
                  $sum: { $cond: [{ $eq: ["$taskStatus", "done"] }, 1, 0] },
                },

                todo: {
                  $sum: { $cond: [{ $eq: ["$taskStatus", "New"] }, 1, 0] },
                },

                inProgress: {
                  $sum: {
                    $cond: [{ $eq: ["$taskStatus", "in_progress"] }, 1, 0],
                  },
                },

                in_qa: {
                  $sum: { $cond: [{ $eq: ["$taskStatus", "qa"] }, 1, 0] },
                },

                closed: {
                  $sum: { $cond: [{ $eq: ["$taskStatus", "closed"] }, 1, 0] },
                },

                live: {
                  $sum: { $cond: [{ $eq: ["$taskStatus", "live"] }, 1, 0] },
                },
                unassignedTasks: {
                  $sum: { $cond: [{ $eq: ["$assignedTo", null] }, 1, 0] },
                },
                originalHrs: { $sum: "$originalTIme" },
                remainingHrs: { $sum: "$RemainingTIme" },
                completedHrs: { $sum: "$CompleteTIme" },

                overdue: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ifNull: ["$due_date", false] },
                          { $lt: ["$due_date", new Date()] },
                          { $ne: ["$taskStatus", "done"] },
                          { $ne: ["$taskStatus", "closed"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: { _id: 0 },
            },
          ],
          typeStats: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                type: "$_id",
                count: 1,
              },
            },
          ],
          priorityStats: [
            {
              $group: {
                _id: "$priority",
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                priority: "$_id",
                count: 1,
              },
            },
          ],
          assigneeStats: [
            {
              $group: {
                _id: "$assignedTo",
                count: { $sum: 1 },
                taskCount: {
                  $sum: { $cond: [{ $eq: ["$type", "task"] }, 1, 0] },
                },
                bugCount: {
                  $sum: { $cond: [{ $eq: ["$type", "bug"] }, 1, 0] },
                },

                done: {
                  $sum: { $cond: [{ $eq: ["$taskStatus", "done"] }, 1, 0] },
                },

                todo: {
                  $sum: { $cond: [{ $eq: ["$taskStatus", "New"] }, 1, 0] },
                },

                inProgress: {
                  $sum: {
                    $cond: [{ $eq: ["$taskStatus", "in_progress"] }, 1, 0],
                  },
                },

                in_qa: {
                  $sum: { $cond: [{ $eq: ["$taskStatus", "qa"] }, 1, 0] },
                },

                closed: {
                  $sum: { $cond: [{ $eq: ["$taskStatus", "closed"] }, 1, 0] },
                },

                live: {
                  $sum: { $cond: [{ $eq: ["$taskStatus", "live"] }, 1, 0] },
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "_id",
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
            {
              $project: {
                _id: 0,
                userId: "$_id",
                name: "$user.name",
                count: 1,
                taskCount: 1,
                bugCount: 1,
                done: 1,
                todo: 1,
                inProgress: 1,
                in_qa: 1,
                closed: 1,
                live: 1,
              },
            },
            {
              $sort: {
                count: -1,
              },
            },
          ],
          BugRateWidget: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                openbugs: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $in: ["$taskStatus", ["in_progress", "New"]] },
                          { $eq: ["$type", "bug"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                closedbugs: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $in: ["$taskStatus", ["live", "closed"]] },
                          { $eq: ["$type", "bug"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ];
    const result = await TaskModel.aggregate(pipeline);

    const summary = result[0] || {
      totalTasks: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
    };

    return res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      msg: error.message,
    });
  }
};

export const getAdminSummaryWidgets = async (req, res) => {
  try {
    const { loginUser } = req;

    if (!loginUser) {
      return res.status(401).json({
        status: "fail",
        msg: "Unauthorized",
      });
    }

    const companyId = loginUser?.company_name;

    const taskFilter = {
      isDeleted: false,
      companyId: new mongoose.Types.ObjectId(companyId),
    };

    const userFilter = {
      isDeleted: false,
      company_name: companyId,
    };
    const projectFilter = {
      isDeleted: false,
      companyId: companyId,
    };
    const sprintFilter = {
      isDeleted: false,
      companyId: companyId,
    };

    const taskPipeline = [
      {
        $match: taskFilter,
      },
      {
        $facet: {
          taskCount: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
              },
            },
          ],
          permemberassign: [
            {
              $group: {
                _id: "$assignedTo",
                total: { $sum: 1 },
              },
            },
            { $match: { _id: { $ne: null } } },
            {
              $lookup: {
                from: "users",
                localField: "_id",
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
            {
              $project: {
                _id: 1,
                total: 1,
                name: "$user.name",
                userId: "$_id",
              },
            },
            { $limit: 5 },
          ],
          createdBymenber: [
            {
              $group: {
                _id: "$createdBy",
                total: { $sum: 1 },
              },
            },
            { $match: { _id: { $ne: null } } },
            {
              $lookup: {
                from: "users",
                let: { userId: "$_id" },

                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: [
                          "$_id",
                          {
                            $convert: {
                              input: "$$userId",
                              to: "objectId",
                              onError: null,
                              onNull: null,
                            },
                          },
                        ],
                      },
                    },
                  },

                  {
                    $project: {
                      name: 1,
                      email: 1,
                    },
                  },
                ],

                as: "user",
              },
            },

            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                _id: 0,
                userId: "$_id",
                total: 1,
                name: "$user.name",
              },
            },
            { $limit: 5 },
          ],
          Taskbypriority: [
            {
              $group: {
                _id: "$priority",
                total: { $sum: 1 },
              },
            },
          ],
          critialTask: [
            {
              $match: {
                priority: { $eq: "1" },
              },
            },
            {
              $project: {
                title: 1,
                taskStatus: 1,
                due_date: 1,
              },
            },
            { $limit: 5 },
          ],
          OverdueTask: [
            {
              $match: {
                due_date: { $lt: new Date() },
                taskStatus: { $nin: ["done", "closed"] },
              },
            },
            {
              $project: {
                title: 1,
                due_date: 1,
                _id: 1,
              },
            },
            { $limit: 5 },
          ],
          noduedate: [
            {
              $match: {
                due_date: null,
              },
            },
            {
              $count: "total",
            },
          ],
          critialTaskCount: [
            {
              $match: {
                priority: { $eq: "1" },
              },
            },
            {
              $count: "total",
            },
          ],
          OverdueTaskcount: [
            {
              $match: {
                due_date: { $lt: new Date() },
                taskStatus: { $nin: ["done", "closed"] },
              },
            },
            {
              $count: "total",
            },
          ],
          unassigned: [
            {
              $match: {
                assignedTo: null,
              },
            },
            {
              $count: "total",
            },
          ],
          totalSubtasks: [
            {
              $project: {
                count: {
                  $size: "$subtasks",
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$count" },
              },
            },
          ],
          noSubtaskCount: [
            {
              $match: {
                subtasks: { $size: 0 },
              },
            },

            {
              $count: "total",
            },
          ],
          completedSubtaskCount: [
            {
              $match: {
                subtasks: {
                  $elemMatch: {
                    completed: true,
                  },
                },
              },
            },

            {
              $count: "total",
            },
          ],
          pendingSubtaskCount: [
            {
              $match: {
                subtasks: {
                  $elemMatch: {
                    completed: false,
                  },
                },
              },
            },

            {
              $count: "total",
            },
          ],
          totalComments: [
            {
              $project: {
                count: {
                  $size: "$comments",
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$count" },
              },
            },
          ],
          noCommentCount: [
            {
              $match: {
                comments: { $size: 0 },
              },
            },

            {
              $count: "total",
            },
          ],
          mostCommentedTask: [
            {
              $project: {
                title: 1,
                taskStatus: 1,

                commentCount: {
                  $size: "$comments",
                },
              },
            },

            {
              $match: {
                commentCount: {
                  $gt: 0,
                },
              },
            },

            {
              $sort: {
                commentCount: -1,
              },
            },

            {
              $limit: 1,
            },
          ],
          taskContainFile: [
            {
              $match: {
                "attachment.0": {
                  $exists: true,
                },
              },
            },

            {
              $count: "total",
            },
          ],
          taskContainoFile: [
            {
              $match: {
                attachment: { $size: 0 },
              },
            },
            {
              $count: "total",
            },
          ],
          totalattachment: [
            {
              $project: {
                count: {
                  $size: "$attachment",
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$count" },
              },
            },
          ],
        },
      },
    ];
    const userPipeline = [
      {
        $match: userFilter,
      },
      {
        $facet: {
          userCount: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];
    const projectPipeline = [
      {
        $match: projectFilter,
      },
      {
        $facet: {
          projectCount: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];
    const sprintPipeline = [
      {
        $match: sprintFilter,
      },
      {
        $facet: {
          SprintCount: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];
    const [taskResult, userResult, projectResult, sprintResult] =
      await Promise.all([
        TaskModel.aggregate(taskPipeline),
        UsersModel.aggregate(userPipeline),
        ProjectModel.aggregate(projectPipeline),
        SprintModel.aggregate(sprintPipeline),
      ]);
    const taskData = taskResult[0];
    console.log(taskData, "taskData");

    return res.status(200).json({
      status: "success",
      data: {
        totalTasks: taskData.taskCount[0]?.total ?? 0,
        totalUsers: userResult[0].userCount[0]?.total ?? 0,
        totalProjects: projectResult[0].projectCount[0]?.total ?? 0,
        totalSprints: sprintResult[0].SprintCount[0]?.total ?? 0,
        memberWorkload: taskData.permemberassign,
        createdBy: taskData.createdBymenber,
        byPriority: taskData.Taskbypriority,
        criticalTasks: taskData.critialTask,
        overdueTasks: taskData.OverdueTask,
        noduedatecount: taskData.noduedate[0]?.total ?? 0,
        unassignedCount: taskData.unassigned[0]?.total ?? 0,
        critialTaskCount: taskData.critialTaskCount[0]?.total ?? 0,
        OverdueTaskcount: taskData.OverdueTaskcount[0]?.total ?? 0,
        subtasksummary: {
          totalSubtasks: taskData.totalSubtasks[0]?.total ?? 0,
          noSubtaskCount: taskData.noSubtaskCount[0]?.total ?? 0,
          completedSubtaskCount: taskData.completedSubtaskCount[0]?.total ?? 0,
          pendingSubtaskCount: taskData.pendingSubtaskCount[0]?.total ?? 0,
        },
        attachment: {
          totalattachment: taskData.totalattachment[0]?.total ?? 0,
          taskContainFile: taskData.taskContainFile[0]?.total ?? 0,
          taskContainoFile: taskData.taskContainoFile[0]?.total ?? 0,
        },
        commentSummary: {
          totalComments: taskData.totalComments[0]?.total ?? 0,
          noCommentCount: taskData.noCommentCount[0]?.total ?? 0,
          mostCommentedTask: taskData.mostCommentedTask[0] ?? "",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      msg: error.message,
    });
  }
};
