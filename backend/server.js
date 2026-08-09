
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "./config.env" });
import http from "http";
import { Server } from "socket.io";
import App from "./index.js"
import { initSocket } from "./Socket/socket.js";

 const server = http.createServer(App); // we use it for make connection between app and socket io

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://taskmanagerapp.giize.com",
    ],
    credentials: true,
  },
});

initSocket(io);

io.on("connection", (socket) => {
   socket.on("joinRoom", (userId) => {
    socket.join(userId);

    console.log(`${userId} joined room`);
  });
  

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

mongoose
  .connect(process.env.CON_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log("some error occured");
  });



const Port = process.env.PORT || 3009;
server.listen(Port, () => {
  console.log("server has started.....");
});
