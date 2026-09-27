import { TagModel } from "../Model/tagModel.js";
import { getCache, setCache, deleteCache } from "../service/redis.service.js";

export const getAllTags = async (req, res) => {
  try {
    let query = {};
    const { loginUser } = req;
    const projectId = loginUser?.preferences?.activeProject?.projectId;

    if (!projectId) {
      return res.status(401).json({
        data: {
          msg: "Unotherized login",
        },
      });
    }
    const cacheKey = `tags:project:${projectId}`;
    const cachedTags = await getCache(cacheKey);

    if (cachedTags) {
      console.log("Redis CACHE HIT:", cacheKey);

      return res.status(200).json({
        status: 201,
        data: {
          tags: cachedTags,
        },
      });
    }
    console.log("Redis CACHE MISS:", cacheKey);

    query.isDeleted = "false";
    query.projectId = projectId;
    const tags = await TagModel.find(query);

    await setCache(cacheKey, tags, 300);

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

    await deleteCache(`tags:project:${projectId}`);

    res.status(201).json({
      status: "Success",
      data: {
        tag,
        status: 201,
        msg: "Tag Created SucessFully",
      },
    });
  } catch (err) {
    console.error("🔥 CREATE TAG ERROR:", err);

    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};
export const updateTag = async (req, res) => {
  try {
    const { loginUser } = req;
    const projectId = loginUser?.preferences?.activeProject?.projectId;
    const id = req.params.id;
    const updatedTag = await TagModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTag) {
      return res.status(404).json({
        status: "fail",
        msg: "Tag not found",
      });
    }

    await deleteCache(`tags:project:${projectId}`);
    res.status(200).json({
      status: "success",
      data: {
        updatedTag,
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
    const { loginUser } = req;
    const projectId = loginUser?.preferences?.activeProject?.projectId;
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

    const deletedTag = await TagModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
        },
      },
      {
        new: true,
      }
    );
    if (!deletedTag) {
      return res.status(404).json({
        status: "fail",
        msg: "Tag not found",
      });
    }

    await deleteCache(`tags:project:${projectId}`);
    res.status(200).json({
      status: "success",
      data: {
        deletedTag,
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
