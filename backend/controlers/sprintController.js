import { SprintModel } from "../Model/sprintModel.js";
import { UsersModel } from "../Model/userModel.js";

export const getAllSprint = async (req, res) => {
  try {
    let query = {};
    const {
      dateFrom,
      dateTo,
      searchValue,
      sortFIeld,
      sortDirection,
      limit = 10,
      offset = 0,
    } = req.query;
    if (req.loginUser.company_name) {
      query.companyId = req.loginUser.company_name;
    } else {
      return res.status(401).json({
        data: {
          msg: "unothorized",
        },
      });
    }
    if (req.loginUser?.preferences?.activeProject?.projectId) {
      query.projectId = req.loginUser?.preferences?.activeProject?.projectId;
    } else {
      return res.status(401).json({
        data: {
          msg: "unothorized",
        },
      });
    }
    if (dateFrom && dateTo) {
      query.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo + "T23:59:59.999Z"),
      };
    }
    query.isDeleted = false;
    if (searchValue) {
      query.sprintName = {
        $regex: searchValue,
        $options: "i",
      };
    }
    let mongoQuery = SprintModel.find(query);
    if (sortFIeld) {
      mongoQuery = mongoQuery.sort({
        [sortFIeld]: sortDirection === "asc" ? 1 : -1,
      });
    }
    const fetchSprint = await mongoQuery
      .skip(Number(offset))
      .limit(Number(limit));
    const totalCount = await SprintModel.countDocuments(query);
    res.status(200).json({
      status: 200,
      data: {
        length: totalCount,
        fetchSprint,
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

export const createSprint = async (req, res) => {
  try {
    const { companyId, user } = req;
    const userdetails = await UsersModel.findById(user?.id);
    const projectId = userdetails?.preferences?.activeProject?.projectId;
    const { sprintName, startDate, endDate } = req.body;
    if (!sprintName || !companyId || !projectId) {
      return res.status(400).json({
        data: {
          msg: "project Name and Company name both  required",
        },
      });
    }
    const payload = {
      companyId: companyId,
      sprintName: sprintName,
      projectId: projectId,
      startDate: startDate,
      endDate: endDate,
      createdBy: userdetails._id,
    };
    
    const fetchSprint = await SprintModel.create(payload);
    res.status(201).json({
      status: 201,
      data: {
        msg: "Sprint created Sucessfully",
        fetchSprint,
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

export const UpdateSprint = async (req, res) => {
  try {
    const id = req.params.id;
    const fetchSprint = await SprintModel.findByIdAndUpdate(id, req.body);
    res.status(200).json({
      status: 201,
      data: {
        msg: "Project Updated Sucessfully",
        fetchSprint,
      },
    });
  } catch (error) {
    res.status(401).json({
      status: 401,
      data: {
        msg: "Internal server error",
      },
    });
  }
};

export const DeleteSprint = async (req, res) => {
  try {
    const id = req.params.id;
    const fetchSprint = await SprintModel.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
    res.status(200).json({
      status: 201,
      data: {
        msg: "Project Deleted Sucessfully",
        fetchSprint,
      },
    });
  } catch (error) {
    res.status(401).json({
      status: 401,
      data: {
        msg: "Internal server error",
      },
    });
  }
};
