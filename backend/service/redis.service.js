import redisClient from "../config/redis.js";

export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);

    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error("Redis GET error:", error.message);
    return null;
  }
};

export const setCache = async (key, data, expiry = 300) => {
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: expiry });
  } catch (error) {
    console.error("Redis SET error:", error.message);
  }
};

export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error("Redis DELETE error:", error.message);
  }
};

export const deleteCacheByPattern = async (pattern) => {
  try {
    let cursor = "0";
    let deletedCount = 0;

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });

      cursor = result.cursor;

      if (result.keys.length > 0) {
        const deleted = await redisClient.del(result.keys);

        deletedCount += deleted;
      }
    } while (cursor !== "0");

    return deletedCount;
  } catch (error) {
    console.error("DELETE CACHE PATTERN ERROR:", error.message);

    return 0;
  }
};



export const acquireLock = async (
  lockKey,
  lockValue,
  expiry = 10
) => {
  try {
    const result = await redisClient.set(
      lockKey,
      lockValue,
      {
        NX: true,
        EX: expiry,
      }
    );

    return result === "OK";
  } catch (error) {
    console.error(
      "Redis LOCK error:",
      error.message
    );

    return false;
  }
};

export const releaseLock = async (
  lockKey,
  lockValue
) => {
  try {
    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;

    const result = await redisClient.eval(
      script,
      {
        keys: [lockKey],
        arguments: [lockValue],
      }
    );

    return result === 1;
  } catch (error) {
    console.error(
      "Redis RELEASE LOCK error:",
      error.message
    );

    return false;
  }
};

export const renewLock = async (
  lockKey,
  lockValue,
  expiry = 10
) => {
  try {
    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("EXPIRE", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;

    const result = await redisClient.eval(
      script,
      {
        keys: [lockKey],
        arguments: [
          lockValue,
          expiry.toString(),
        ],
      }
    );

    return result === 1;
  } catch (error) {
    console.error(
      "Redis RENEW LOCK error:",
      error.message
    );

    return false;
  }
};