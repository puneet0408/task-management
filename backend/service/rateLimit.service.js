import redisClient from "../config/redis.js";

export const checkRateLimit = async (
  key,
  limit = 100,
  windowInSeconds = 60
) => {
  try {
    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(key, windowInSeconds);
    }

    const allowed = count <= limit;

    let retryAfter = 0;

    if (!allowed) {
      retryAfter = await redisClient.ttl(key);
    }

    return {
      allowed,
      count,
      remaining: Math.max(limit - count, 0),
      retryAfter: Math.max(retryAfter, 0),
    };
  } catch (error) {
    console.error("Rate limit Redis error:", error.message);

    return {
      allowed: true,
      count: 0,
      remaining: limit,
      retryAfter: 0,
    };
  }
};