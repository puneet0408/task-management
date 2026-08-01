import { KanbanColumnModel } from "../Model/kanbanColumn.js";

export const getAllColumns = async (req, res) => {
  try {
    let query = {};
    const { loginUser } = req;
    if (!loginUser?.preferences?.activeProject?.projectId) {
      return res.status(401).json({
        data: {
          msg: "Unotherized login",
        },
      });
    }
    query.isDeleted = "false";
    query.projectId = loginUser?.preferences?.activeProject?.projectId;
    const data = await KanbanColumnModel.find(query);
    res.status(200).json({
      status: 201,
      data: {
        data,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
export const getColumnID = async (req, res) => {
  try {
    const id = req.params.id;
    const fetchCompany = await KanbanColumnModel.findById(id);
    res.status(200).json({
      status: 201,
      data: {
        length: fetchCompany.length,
        fetchCompany,
        msg: "data get poperly",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
export const createColumn = async (req, res) => {
  try {
    const { loginUser } = req;

    const userId = loginUser?._id;
    const projectId = loginUser?.preferences?.activeProject?.projectId;

    const columnsData = req.body;

    if (!projectId) {
      return res.status(401).json({
        data: {
          msg: "Unauthorized login",
        },
      });
    }

    if (!Array.isArray(columnsData) || columnsData.length === 0) {
      return res.status(400).json({
        msg: "Invalid data. Expected array of columns",
      });
    }

    const payload = columnsData.map((item) => ({
      columnName: item.columnName,
      taskStage: item.taskStage,
      bugStage: item.bugStage,
      order: item.order,
      projectId,
      createdBy: userId,
    }));
    const columns = await KanbanColumnModel.insertMany(payload);

    res.status(201).json({
      status: 200,
      data: {
        columns,
        status: 200,
        msg: "Columns Created Successfully",
      },
    });

  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};
export const updateColumn = async (req, res) => {
  try {
    const { loginUser } = req;
    const userId = loginUser?._id;
    const projectId = loginUser?.preferences?.activeProject?.projectId;

    const data = Array.isArray(req.body) ? req.body : [req.body];

    const updatedColumns = [];

    for (let item of data) {
      const { id, columnName, taskStage, bugStage, order } = item;

      const updated = await KanbanColumnModel.findOneAndUpdate(
        { _id: id, projectId },
        {
          columnName,
          taskStage,
          bugStage,
          order,
          updatedBy: userId,
        },
        { new: true, runValidators: true }
      );

      if (updated) updatedColumns.push(updated);
    }

    res.status(200).json({
      status: 200,
      data: {
        updatedColumns,
        msg: "Columns updated successfully",
      },
    });

  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};
export const deleteColumn = async (req, res) => {
  try {
    const { loginUser } = req;
    const projectId = loginUser?.preferences?.activeProject?.projectId;

    const id = req.params.id;

    const column = await KanbanColumnModel.findOne({
      _id: id,
      projectId,
      isDeleted: false,
    });

    if (!column) {
      return res.status(404).json({
        status: "fail",
        msg: "Column not found",
      });
    }

    await KanbanColumnModel.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });

    res.status(200).json({
      status: "success",
      msg: "Column deleted successfully",
    });

  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};