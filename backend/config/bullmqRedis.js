import { createClient } from "redis";

const bullmqRedis = createClient({
  url: process.env.REDIS_URL,
});

bullmqRedis.on("error", (err) => {
  console.error(
    "BullMQ Redis Client Error:",
    err.message
  );
});

export default bullmqRedis;