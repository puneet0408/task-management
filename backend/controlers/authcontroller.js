import { UsersModel } from "../Model/userModel.js";
import { gethashedPassword, comparePssword } from "../utils/hash.js";
import { CompanyModel } from "../Model/companyModel.js";
import {
  getAccessToken,
  getCookiesPayload,
  getRefreshToken,
  verifyRefreshTOken,
} from "../utils/tokken.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
export const UserRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        data: {
          msg: "name email and password are required",
        },
      });
    }
    const haveuser = await UsersModel.findOne({ email });
    if (haveuser) {
      return res.status(409).json({
        data: {
          msg: "user already found",
        },
      });
    }

    const hashedPassword = await gethashedPassword(password);

    const newUser = await UsersModel.create({
      name,
      email,
      password: hashedPassword,
    });
    const payload = {
      userId: newUser._id,
      email: newUser.email,
    };

    const accessToken = getAccessToken(payload);

    const refreshToken = getRefreshToken({ userId: newUser._id });

    const createCookies = getCookiesPayload();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await UsersModel.findByIdAndUpdate(newUser._id, {
      $push: {
        refreshToken: {
          token: refreshToken,
          expiresAt,
        },
      },
    });

    res.cookie("refreshtoken", refreshToken, createCookies);
    res.cookie("accessToken", accessToken, createCookies);
    res.status(201).json({
      msg: "user Registered sucessfully",
      status: 201,
    });
  } catch (error) {
    res.status(500).json({
      data: {
        error,
      },
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        data: {
          msg: "email and password is Missing",
        },
      });
    }
    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        data: {
          msg: "Wrong email and password",
        },
      });
    }
    let companyid = user?.company_name;
    const Companycheck = await CompanyModel.findById(companyid);
    if (user?.role != "superadmin") {
      if (!Companycheck) {
        return res.status(404).json({
          data: {
            msg: "Company not found",
          },
        });
      }
    }

    if (user?.status === "inactive") {
      return res.status(404).json({
        data: {
          msg: "Account Suspanded please connect to admin",
        },
      });
    }
    if (Companycheck?.status === "inactive") {
      return res.status(404).json({
        data: {
          msg: "Company Suspanded please connect to admin",
        },
      });
    }
    const isPasswordMatched = await comparePssword(password, user?.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        data: {
          msg: "Wrong email and password",
        },
      });
    }
    const payload = {
      userId: user._id,
      email: user.email,
    };
    const accessToken = getAccessToken(payload);
    const refreshToken = getRefreshToken({ userId: user._id });
    const createCookies = getCookiesPayload();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await UsersModel.findByIdAndUpdate(user._id, {
      $push: {
        refreshToken: {
          token: refreshToken,
          expiresAt,
        },
      },
      $set: {
        "preferences.activeProject.projectId":
          user?.preferences?.defaultProjectId,
        "preferences.lastProjectId": user?.preferences?.defaultProjectId,
      },
    });
    res.cookie("refreshtoken", refreshToken, createCookies);
    res.cookie("accessToken", accessToken, createCookies);
    res.status(201).json({
      msg: "user Login SucessFuly",
      data: user,
      status: 201,
    });
  } catch (error) {
    res.status(500).json({
      data: {
        error,
      },
    });
  }
};

export const refreshtoken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshtoken;

    if (!refreshToken) {
      return res.status(500).json({
        data: {
          msg: "Login Again",
        },
      });
    }
    const isvalidToken = verifyRefreshTOken(refreshToken);
    if (!isvalidToken) {
      return res.status(500).json({
        data: {
          msg: "Login Again",
        },
      });
    }
    const user = await UsersModel.findById(isvalidToken?.userId);
    if (!user) {
      return res.status(500).json({
        data: {
          msg: "Login Again",
        },
      });
    }
    const getRefreshtokken = user?.refreshToken?.find(
      (t) => t?.token === refreshToken
    );
    if (!getRefreshtokken) {
      return res.status(500).json({
        data: {
          msg: "Login Again",
        },
      });
    }
    if (new Date(getRefreshtokken.expiresAt) < new Date()) {
      return res.status(500).json({
        data: {
          msg: "Login Again",
        },
      });
    }
    const payload = {
      userId: user._id,
      email: user.email,
    };

    const accessToken = getAccessToken(payload);
    const createCookies = getCookiesPayload();

    res.cookie("accessToken", accessToken, createCookies);
    res.status(201).json({
      msg: "new accress token generated",
      data: user,
      status: 201,
    });
  } catch (error) {
    res.status(500).json({
      data: {
        msg: "error while genetate",
      },
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshtoken;

    if (!refreshToken) {
      res.clearCookie("refreshtoken");
      res.clearCookie("accesstoken");
      return res.status(401).json({ msg: "Login Again" });
    }

    const decoded = verifyRefreshTOken(refreshToken);
    if (!decoded) {
      res.clearCookie("refreshtoken");
      res.clearCookie("accesstoken");
      return res.status(401).json({ msg: "Login Again" });
    }

    await UsersModel.updateOne(
      { _id: decoded.userId },
      {
        $pull: {
          refreshToken: { token: refreshToken },
        },
      }
    );

    res.clearCookie("refreshtoken");
    res.clearCookie("accesstoken");

    res.status(200).json({
      msg: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error while logout",
    });
  }
};

export const logoutAllUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshtoken;
    if (!refreshToken) {
      res.clearCookie("refreshtoken");
      res.clearCookie("accesstoken");
      return res.status(500).json({
        data: {
          msg: "Login Again",
        },
      });
    }
    const isvalidToken = verifyRefreshTOken(refreshToken);
    if (!isvalidToken) {
      res.clearCookie("refreshtoken");
      res.clearCookie("accesstoken");
      return res.status(500).json({
        data: {
          msg: "Login Again",
        },
      });
    }
    let user = await UsersModel.findById(isvalidToken?.userId);
    if (!user) {
      res.clearCookie("refreshtoken");
      res.clearCookie("accesstoken");
      return res.status(500).json({
        data: {
          msg: "Login Again",
        },
      });
    }

    user.refreshToken = [];
    await user.save();
    res.clearCookie("refreshtoken");
    res.clearCookie("accesstoken");
    res.status(201).json({
      msg: "Logout from al devices User",
      data: user,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      data: {
        msg: "error while genetate",
      },
    });
  }
};

export const createPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) {
      return res.status(400).json({
        msg: "Token and password are required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UsersModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        msg: "Invalid or expired token",
      });
    }

    const hashedPassword = await gethashedPassword(password);
    await UsersModel.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          status: "active",
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpire: "",
        },
      }
    );
    res.status(200).json({
      msg: "Password set successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg: "Internal server error",
    });
  }
};
