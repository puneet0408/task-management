import redisClient from "../config/redis.js";

export const checkSlidingRateLimit = async (
  key,
  limit = 100,
  windowInSeconds = 60
) => {
  try {
    const now = Date.now();

    // Start of the sliding window
    const windowStart = now - windowInSeconds * 1000;

    // 1. Remove requests older than the current window
    await redisClient.zRemRangeByScore(key, 0, windowStart);

    // 2. Count requests still inside the window
    const count = await redisClient.zCard(key);

    // 3. If limit reached, reject
    if (count >= limit) {
      const oldestRequest = await redisClient.zRangeWithScores(key, 0, 0);

      let retryAfter = 0;

      if (oldestRequest.length > 0) {
        const oldestTimestamp = Number(oldestRequest[0].score);

        retryAfter = Math.ceil(
          (oldestTimestamp + windowInSeconds * 1000 - now) / 1000
        );
      }

      return {
        allowed: false,
        count,
        remaining: 0,
        retryAfter: Math.max(retryAfter, 0),
      };
    }

    // 4. Add current request
    const member = `${now}-${Math.random()}`;

    await redisClient.zAdd(key, [
      {
        score: now,
        value: member,
      },
    ]);

    // 5. Automatically remove the whole key after
    // the window expires if there are no new requests.
    await redisClient.expire(key, windowInSeconds);

    return {
      allowed: true,
      count: count + 1,
      remaining: Math.max(limit - (count + 1), 0),
      retryAfter: 0,
    };
  } catch (error) {
    console.error("Sliding rate limit Redis error:", error.message);

    // Fail open if Redis is unavailable
    return {
      allowed: true,
      count: 0,
      remaining: limit,
      retryAfter: 0,
    };
  }
};
