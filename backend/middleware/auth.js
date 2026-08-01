import { verifyAccessToken } from "../utils/tokken.js";
import { UsersModel } from "../Model/userModel.js";

export const authenticate = (req, res, next) => {
  try {
    const accessToken = req?.cookies?.accessToken;
    if (!accessToken) {
      return res.status(401).json({
        data: {
          msg: "unotherized",
        },
      });
    }
    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return res.status(401).json({
        data: {
          msg: "unotherized",
        },
      });
    }
    req.user = {
      id: payload?.userId,
      email: payload?.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      data: {
        msg: "unotherized",
      },
    });
  }
};

export const authorized = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        message: "Forbidden",
        status: false,
      });
    }

    const { id } = req.user;
    if (!id) {
      return res.status(403).json({
        message: "Forbidden",
        status: false,
      });
    }
    const user = await UsersModel.findById(id);

    if (!user || !user.role) {
      return res.status(403).json({
        message: "Forbidden",
        status: false,
      });
    }
    req.loginUser = user;
    if (user.role === "superadmin") {
      req.filterRole = ["admin"];
    }
    if (user.role === "admin") {
      req.filterRole = ["employee", "manager"];
      req.companyId = user.company_name;
    }

    if (user.role === "manager") {
      req.filterRole = ["employee"];
      req.companyId = user.company_name;
    }
      if (user.role === "employee") {
      req.companyId = user.company_name;
    }
    next();
  } catch (error) {
    return res.status(401).json({
      data: {
        msg: "unauthorized",
      },
    });
  }
};

export const authorizedAllusers = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        message: "Forbidden",
        status: false,
      });
    }

    const { id } = req.user;
    if (!id) {
      return res.status(403).json({
        message: "Forbidden",
        status: false,
      });
    }
    const user = await UsersModel.findById(id);
    if (!user || !user.role) {
      return res.status(403).json({
        message: "Forbidden",
        status: false,
      });
    }
    req.loginUser = user;
    if (user.role === "superadmin") {
      req.filterRole = ["admin"];
    }
    req.companyId = user.company_name;
    next();
  } catch (error) {
    return res.status(401).json({
      data: {
        msg: "unauthorized",
      },
    });
  }
};
