import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(
  process.env.REDIS_URL,
  {
    maxRetriesPerRequest: null,
  }
);

export const notificationQueue = new Queue(
  "notificationQueue",
  {
    connection,

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 1000,
      },

      removeOnComplete: 100,
      removeOnFail: 500,
    },
  }
);