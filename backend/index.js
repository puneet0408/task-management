
import express from "express";
import morgan from "morgan";
import CompanyRoutes from "./Router/companyRoutes.js";
import UserRouter from "./Router/userroutes.js";
import ProjectRoutes from "./Router/projectRouters.js";
import SprintRoutes from "./Router/sprintRouters.js";
import TaskRoutes from "./Router/taskRoutes.js";
import TagRoutes from "./Router/tagRoutes.js";
import KAnbanColumnRoutes from "./Router/kanbanRoutes.js";
import TaskActivityRoutes from "./Router/taskActivityRoutes.js";
import dashboardRoutes from "./Router/dashboardwidget.js";
import NotificationRoutes from "./Router/notificationRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import color from "colors";
import AwsUploadRoutes from "./Router/awsmediaURL.js";
 let App = express();
App.use(express.json());
App.use(cookieParser());
App.use(cors("*"));

if(process.env.NODE_ENV === "development"){
App.use(morgan('dev'));
}

App.use(express.static("./public"));

// App.use(logger);
App.use((req , res , next)=>{
req.requrestedat = new Date().toISOString()
next();
})


 App.use("/auth/v1/companies",CompanyRoutes);
 App.use("/auth/v1/",UserRouter);
 App.use("/auth/v1/project",ProjectRoutes);
 App.use("/auth/v1/sprint",SprintRoutes);
 App.use("/auth/v1/task",TaskRoutes);
 App.use("/auth/v1/tag",TagRoutes);
 App.use("/auth/vi/kanbancolumn" ,KAnbanColumnRoutes);
 App.use("/auth/v1/mediauploader", AwsUploadRoutes);
 App.use("/auth/v1/taskActivity",TaskActivityRoutes);
 App.use("/auth/vi/dashboard",dashboardRoutes);
 App.use("/auth/vi/notification",NotificationRoutes)
 

export  default App;
