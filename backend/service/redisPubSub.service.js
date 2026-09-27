import redisClient from "../config/redis.js";
import { getIO } from "../Socket/socket.js";

export const publishMessage = async (channel, message) => {
  try {
    await redisClient.publish(
      channel,
      JSON.stringify(message)
    );

    console.log(`Redis Published → ${channel}`);
  } catch (error) {
    console.error(
      "Redis Publish Error:",
      error.message
    );
  }
};

export const startRedisSubscriber = async () => {
  try {
    const subscriber = redisClient.duplicate();

    subscriber.on("error", (error) => {
      console.error(
        "Redis Subscriber Error:",
        error.message
      );
    });

    await subscriber.connect();

    await subscriber.subscribe(
      "notifications",
      (message) => {
        try {
          const data = JSON.parse(message);

          console.log(
            "Redis Notification Received:",
            data
          );

          const io = getIO();

          io.to(data.userId.toString()).emit(
            "newNotification",
            data.notification
          );

        } catch (error) {
          console.error(
            "Redis Notification Error:",
            error.message
          );
        }
      }
    );

    console.log(
      "Redis Subscriber Connected"
    );
  } catch (error) {
    console.error(
      "Redis Subscriber Start Error:",
      error.message
    );
  }
};