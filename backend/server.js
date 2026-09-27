
import dotenv from "dotenv";
import mongoose from "mongoose";
import redisClient from "./config/redis.js";
import { checkRateLimit } from "./service/rateLimit.service.js";
import { checkSlidingRateLimit } from "./service/slidingRateLimit.service.js";
import { checkSlidingRateLimitAtomic } from "./service/slidingRateLimitAtomic.service.js";
import {
  startRedisSubscriber,
} from "./service/redisPubSub.service.js";

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
redisClient
  .connect()
    .then(async () => {
    console.log("Redis connected");
    await startRedisSubscriber();
  })
  .catch((err) => {
    console.error("Redis connection failed:", err);
  });
//     const result = await checkRateLimit(
//   "rate_limit:test:user:123",
//   5,
//   60
// );
const key = "test:sliding:atomic:user123";

for (let i = 1; i <= 7; i++) {
  const result = await checkSlidingRateLimitAtomic(
    key,
    5,
    10
  );

  console.log(`Request ${i}:`, result);
}
// console.log("RATE LIMIT RESULT:", result);
  console.log("TEST HOT RELOADinggggggggggg");
const Port = process.env.PORT || 3009;
server.listen(Port, () => {
  console.log("server has started.....");
});
