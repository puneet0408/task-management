import redisClient from "../config/redis.js";

const slidingWindowScript = `
  local key = KEYS[1]

  local now = tonumber(ARGV[1])
  local windowMs = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local member = ARGV[4]

  local windowStart = now - windowMs

  -- Remove old requests
  redis.call(
    "ZREMRANGEBYSCORE",
    key,
    0,
    windowStart
  )

  -- Count current requests
  local count = redis.call(
    "ZCARD",
    key
  )

  -- Limit reached
  if count >= limit then

    local oldest = redis.call(
      "ZRANGE",
      key,
      0,
      0,
      "WITHSCORES"
    )

    local retryAfter = 0

    if #oldest >= 2 then
      local oldestTimestamp = tonumber(oldest[2])

      retryAfter = math.ceil(
        (oldestTimestamp + windowMs - now) / 1000
      )
    end

    return {
      0,
      count,
      retryAfter
    }
  end

  -- Add current request
  redis.call(
    "ZADD",
    key,
    now,
    member
  )

  -- Keep Redis key temporary
  redis.call(
    "EXPIRE",
    key,
    math.ceil(windowMs / 1000)
  )

  return {
    1,
    count + 1,
    0
  }
`;

export const checkSlidingRateLimitAtomic = async (
  key,
  limit = 100,
  windowInSeconds = 60
) => {
  try {
    const now = Date.now();

    const member = `${now}-${Math.random()}`;

    const result = await redisClient.eval(
      slidingWindowScript,
      {
        keys: [key],
        arguments: [
          now.toString(),
          (windowInSeconds * 1000).toString(),
          limit.toString(),
          member,
        ],
      }
    );

    const allowed = Number(result[0]) === 1;
    const count = Number(result[1]);
    const retryAfter = Number(result[2]);

    return {
      allowed,
      count,
      remaining: Math.max(
        limit - count,
        0
      ),
      retryAfter: Math.max(
        retryAfter,
        0
      ),
    };
  } catch (error) {
    console.error(
      "Atomic sliding rate limit Redis error:",
      error.message
    );

    // Fail open
    return {
      allowed: true,
      count: 0,
      remaining: limit,
      retryAfter: 0,
    };
  }
};