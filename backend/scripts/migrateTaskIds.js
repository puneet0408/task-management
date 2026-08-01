import mongoose from "mongoose";
import dotenv from "dotenv";

import { ProjectModel } from "../Model/projectModel.js";
import { TaskModel } from "../Model/taskModel.js";

dotenv.config({ path: "./config.env" });

async function migrateTaskIds() {
  try {
    await mongoose.connect(process.env.CON_STR);

    console.log("✅ MongoDB Connected");

    const projects = await ProjectModel.find({});

    for (const project of projects) {
      const tasks = await TaskModel.find({
        projectId: project._id,
      }).sort({ createdAt: 1 });

      let counter = 1;

      for (const task of tasks) {
        task.taskId = counter;
        await task.save();
        counter++;
      }

      project.taskCounter = tasks.length;
      await project.save();
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
    process.exit(0);
  }
}

migrateTaskIds();
