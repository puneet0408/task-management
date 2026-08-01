import { TagModel } from "../Model/tagModel.js";

export const getAllTags = async (req, res) => {
  try {
    let query = {};
    const { loginUser } = req;
    if(!loginUser?.preferences?.activeProject?.projectId){
     return res.status(401).json({
        data: {
          msg: "Unotherized login",
        },
      });
    }
    query.isDeleted = "false";
    query.projectId = loginUser?.preferences?.activeProject?.projectId ;
    const tags = await TagModel.find(query);
    res.status(200).json({
      status: 201,
      data: {
        tags,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
export const gettagID = async (req, res) => {
  try {
    const id = req.params.id;
    const fetchCompany = await TagModel.findById(id);
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
export const createTag = async (req, res) => {
  try {
    const { loginUser } = req;

    const userId = loginUser?._id;
    const projectId = loginUser?.preferences?.activeProject?.projectId;
    const { tagName } = req.body;
    if (!projectId) {
      return res.status(401).json({
        data: {
          msg: "Unotherized login",
        },
      });
    }

    const payload = {
      tagName,
      projectId,
      createdBy: userId,
    };
    const tag = await TagModel.create(payload);
    res.status(201).json({
      status: "Success",
      data: {
        tag,
        status: 201,
        msg: "Tag Created SucessFully",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};
export const updateTag = async (req, res) => {
  try {
    const id = req.params.id;
    const updateCompany = await TagModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        updateCompany,
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
export const deleteTag = async (req, res) => {
  try {
    const id = req.params.id;
    const getByid = await TagModel.findById(id);
    if (!getByid) {
      res.status(200).json({
        status: "success",
        data: {
          msg: "data Not Found",
        },
      });
      return;
    }

    await TagModel.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        deleteCompany,
        status: 201,
        msg: "data delete poperly",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};
