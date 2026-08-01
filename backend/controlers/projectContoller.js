import { ProjectModel } from "../Model/projectModel.js";
import { CompanyModel } from "../Model/companyModel.js";
import { UsersModel } from "../Model/userModel.js";
import { SprintModel } from "../Model/sprintModel.js";

export const getAllProjects = async (req, res) => {
  try {
    let query = {};
    const { dateFrom, dateTo, searchValue } = req.query;
    const { companyId, user } = req;

    // 🔍 Text Search
    if (searchValue?.trim()) {
      query.$text = { $search: searchValue.trim() };
    }

    // 📅 Date Filter
    if (dateFrom && dateTo) {
      query.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(`${dateTo}T23:59:59.999Z`),
      };
    }

    // 👤 User Role
    const userdetails = await UsersModel.findById(user?.id).lean();
    if (!userdetails) {
      return res.status(401).json({ msg: "User not found" });
    }

    if (userdetails.role === "manager" || userdetails.role === "employee") {
      if (userdetails.project_name) {
        query._id = { $in: [].concat(userdetails.project_name) };
      }
    }

    // 🏢 Company Filter
    if (!companyId) {
      return res.status(400).json({
        data: { msg: "Company name is required" },
      });
    }
    query.companyId = companyId;

    // 🗑️ Soft Delete
    query.isDeleted = false;

    const [projects, totalCount] = await Promise.all([
      ProjectModel.find(query).lean(),
      ProjectModel.countDocuments(query),
    ]);

    return res.status(200).json({
      status: "Success",
      data: {
        length: totalCount,
        project: projects,
      },
    });
  } catch (error) {
    console.error("getAllProjects error:", error);
    return res.status(500).json({
      status: "Failed",
      data: { msg: "Internal server error" },
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const { user, companyId } = req;
    const userId = user?.id;
    const { projectName, description, status } = req.body;
    const Companydtails = CompanyModel.find({ uuid: companyId });
    if (!Companydtails) {
      return res.status(401).json({
        data: {
          msg: "Company not found",
        },
      });
    }
    
    const projectCount = await ProjectModel.countDocuments({
      companyId: companyId,isDeleted:false
    });
    if (projectCount >= Companydtails?.limit?.maxProjects) {
      return res.status(401).json({
        data: {
          msg: "You reached your max project limit. Contact admin.",
        },
      });
    }
    if (!projectName || !companyId) {
      return res.status(401).json({
        data: {
          msg: "project Name and Company details both Required",
        },
      });
    }

    const payload = {
      projectName,
      companyId,
      createdBy: userId,
      description,
      status,
    };
    const fetchProject = await ProjectModel.create(payload);
    res.status(200).json({
      status: 200,
      data: {
        msg: "Project created Sucessfully",
        fetchProject,
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

export const UpdateProject = async (req, res) => {
  try {
     const {  companyId } = req;
    const { projectName } = req.body;
    
    if (!projectName || !companyId) {
      return res.status(400).json({
        data: {
          msg: "project Name and Company name both  required",
        },
      });
    }
    const id = req.params.id;
    const fetchProject = await ProjectModel.findByIdAndUpdate(id, req.body);
    res.status(200).json({
     status: 200,
      data: {
        msg: "Project Updated Sucessfully",
        fetchProject,
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

export const DeleteProject = async (req, res) => {
  try {
    const id = req.params.id;
    const fetchProject = await ProjectModel.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
    res.status(200).json({
     status: 200,
      data: {
        msg: "Project Deleted Sucessfully",
        fetchProject,
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

export const markDefaultProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        status: "failed",
        message: "Project not found",
      });
    }
    const user = await UsersModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          "preferences.defaultProjectId": projectId,
          "preferences.activeProject.projectId": projectId,
          "preferences.activeProject.projectName": project?.projectName,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      message: "Default project updated successfully",
      data: {
        activeProject: user?.preferences?.activeProject?.projectName,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const markDefaultSprint = async (req, res) => {
  try {
    const userId = req.user.id;
    const sprintId = req.params.sprintId;
    const Sprint = await SprintModel.findById(sprintId);
    if (!Sprint) {
      return res.status(404).json({
        status: "failed",
        message: "Sprint not found",
      });
    }
    const user = await UsersModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          "preferences.Activesprint.sprintId": sprintId,
          "preferences.Activesprint.sprintName": Sprint?.sprintName,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      message: "Default sprint updated successfully",
      data: {
        activesprint: user?.preferences?.Activesprint?.sprintId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const markLastPreferenceProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        status: "failed",
        message: "Project not found",
      });
    }
    const user = await UsersModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          "preferences.lastProjectId": projectId,
          "preferences.activeProject.projectId": projectId,
          "preferences.activeProject.projectName": project?.projectName,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      message: "Default project updated successfully",
      data: {
        activeProject: user?.preferences?.activeProject?.projectName,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
