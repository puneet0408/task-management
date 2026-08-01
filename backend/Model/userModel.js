import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required Field"],
    },
    company_name: {
      type: String,
    },
    project_name: {
      type: [String],
      default: [],
    },
    email: {
      type: String,
      required: [true, "Email is required Field"],
      unique: true,
    },
    preferences: {
      defaultProjectId: String,
      lastProjectId: String,
     Activesprint:{
      sprintId:String,
      sprintName:String,
     },
      activeProject: {
        projectId: String,
        projectName: String,
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    password: String,
    status: {
      type: String,
      default: "pending",
    },
    refreshToken: [
      {
        token: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
        createdAT: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    role: {
      type: String,
      enum: ["superadmin", "admin", "manager", "employee"],
      default: ["employee"],
    },
    address: {
      type: String,
    },
    contact_no: {
      type: Number,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    permission: {
      type: String,
      default: "allowAction",
    },
     profilepic: {
        name: { type: String, trim: true },
        type: { type: String, trim: true },
        url: { type: String, trim: true },
      },
    
  },
  { timestamps: true },
);
UserSchema.index({
  name: "text",
  email: "text",
});

export const UsersModel =
  mongoose.models.User || mongoose.model("users", UserSchema);
