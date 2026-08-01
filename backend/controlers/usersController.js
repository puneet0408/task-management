import { UsersModel } from "../Model/userModel.js";
import mongoose from "mongoose";
import { CompanyModel } from "../Model/companyModel.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export const getAllUsersWithLoginUser = async (req, res) => {
  try {
    let query = {};
    if (req.companyId) {
      query.company_name = req.companyId;
    } else {
      return res.status(401).json({
        data: {
          msg: "unothorized",
        },
      });
    }
    query.isDeleted = false;
    const pipLine = [
      { $match: query },
      {
        $project: {
          name: 1,
          company_name: 1,
          email: 1,
          status: 1,
          role: 1,
          city: 1,
          address: 1,
          contact_no: 1,
          country: 1,
          state: 1,
          isDeleted: 1,
          updatedAt: 1,
          project_name: 1,
          createdAt: 1,
          updatedAt: 1,
          permission: 1,
          profilepic: 1,
        },
      },
    ];
    let users = await UsersModel.aggregate(pipLine);
    res.status(200).json({
      status: 200,
      data: {
        users,
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

export const getAllUsersWithoutloginuser = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      searchValue,
      sortFIeld,
      sortDirection,
      limit = 10,
      offset = 0,
    } = req.query;
    let matchStage = { isDeleted: false };
    if (req.filterRole) {
      matchStage.role = Array.isArray(req.filterRole)
        ? { $in: req.filterRole }
        : req.filterRole;
    }
    if (req.companyId) {
      matchStage.company_name = req.companyId;
    }
    if (dateFrom && dateTo) {
      matchStage.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(`${dateTo}T23:59:59.999Z`),
      };
    }
    if (searchValue) {
      matchStage.$or = [
        { name: { $regex: searchValue, $options: "i" } },
        { email: { $regex: searchValue, $options: "i" } },
      ];
    }
    const sortStage = sortFIeld
      ? { [sortFIeld]: sortDirection === "asc" ? 1 : -1 }
      : { createdAt: -1 };
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "companies",
          let: { cid: "$company_name" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    "$_id",
                    {
                      $convert: {
                        input: "$$cid",
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
                company_name: 1,
              },
            },
          ],
          as: "company",
        },
      },

      {
        $unwind: {
          path: "$company",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          preferences: 1,
          createdAt: 1,
          contact_no: 1,
          project_name: 1,
          city: 1,
          state: 1,
          country: 1,
          address: 1,
          "company.company_name": 1,
             createdAt: 1,
          updatedAt: 1,
          permission: 1,
          profilepic: 1,
        },
      },

      { $sort: sortStage },
      { $skip: Number(offset) },
      { $limit: Number(limit) },
    ];
    const [users, totalCount] = await Promise.all([
      UsersModel.aggregate(pipeline),
      UsersModel.countDocuments(matchStage),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        length: totalCount,
        users,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};

export const postUsers = async (req, res) => {
  try {
    const { companyId } = req;
    let company_name;
    if (req.body.company_name) {
      company_name = req.body.company_name;
    } else {
      company_name = companyId;
    }

    const Companydtails = await CompanyModel.findById(company_name);
    if (!Companydtails) {
      return res.status(401).json({
        data: {
          msg: "Company not found",
        },
      });
    }
    const userCount = await UsersModel.countDocuments({
      company_name: companyId,
    });

    const existingUser = await UsersModel.findOne({
      name: req.body.name,
      email: req.body.email,
    });

    if (existingUser) {
      return res.status(401).json({
        data: {
          msg: "User already exists with same name and email",
        },
      });
    }
    if (userCount >= Number(Companydtails?.limit?.maxUsers || 0)) {
      return res.status(401).json({
        data: {
          msg: `User limit exceeded. Maximum ${Companydtails?.limit?.maxUsers} users allowed.`,
          action: "showpaymentgateway",
        },
      });
    }
    const fetchusers = new UsersModel({
      name: req.body.name,
      email: req.body.email,
      contact_no: req.body.contact_no,
      role: req.body.role,
      company_name: company_name,
      project_name: Array.isArray(req.body.project_name)
        ? req.body.project_name
        : [req.body.project_name],
    });
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    fetchusers.resetPasswordToken = hashedToken;
    fetchusers.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000;
    await fetchusers.save();
    const resetLink = `http://localhost:5173/createpassword/${token}`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: fetchusers.email,
      subject: "Set Your Password",
      html: `
        <div style="font-family: Arial;">
          <h2>Welcome ${fetchusers.name}</h2>
          <p>Please click below to set your password:</p>
          <a href="${resetLink}"
            style="background:#4CAF50;color:#fff;
            padding:10px 20px;
            text-decoration:none;
            border-radius:5px;">
            Set Password
          </a>
          <p>This link expires in 24 hours.</p>
        </div>
      `,
    });
    res.status(200).json({
      status: 201,
      msg: "User created & email sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error,
      msg: "Internal server error",
    });
  }
};

export const updateUsers = async (req, res) => {
  try {
    const id = req.params.id;
    const updateUsers = await UsersModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 201,
      data: {
        status: 201,
        msg: "data Udapted Properly",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};

export const deleteUsers = async (req, res) => {
  try {
    const id = req.params.id;
    await UsersModel.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        status: 201,
        msg: "user delete poperly",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const existingUser = await UsersModel.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        status: "fail",
        msg: "User not found",
      });
    }
    if (existingUser.role === "superadmin") {
      return res.status(200).json({
        status: "success",
        data: {
          user: existingUser,
          msg: "Profile fetched successfully",
        },
      });
    }
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "companies",
          let: { cid: "$company_name" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    "$_id",
                    {
                      $convert: {
                        input: "$$cid",
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
                company_name: 1,
              },
            },
          ],
          as: "company",
        },
      },
      {
        $unwind: {
          path: "$company",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          status: 1,
          preferences: 1,
          createdAt: 1,
          "company.company_name": 1, 
        },
      },
    ];
    const result = await UsersModel.aggregate(pipeline);

    res.status(200).json({
      status: "success",
      data: {
        user: result[0] || null,
        msg: "Profile fetched successfully",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
