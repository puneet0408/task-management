import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(
  process.env.REDIS_URL,
  {
    maxRetriesPerRequest: null,
  }
);

const worker = new Worker(
  "notificationQueue",

  async (job) => {
    console.log(
      "Processing job:",
      job.name,
      job.data
    );

    if (job.name === "sendNotification") {
      console.log(
        `Sending notification to user ${job.data.userId}`
      );

      // Heavy work goes here
    }
  },

  {
    connection,
  }
);

worker.on("completed", (job) => {
  console.log(
    `Job ${job.id} completed`
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `Job ${job?.id} failed:`,
    error.message
  );
});