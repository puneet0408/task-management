// import { checkRateLimit } from "../service/rateLimit.service.js";

// export const rateLimitMiddleware = (
//   resource,
//   limit = 100,
//   windowInSeconds = 60
// ) => {
//   return async (req, res, next) => {
//     try {
//       const userId = req.loginUser?._id?.toString();

//       const key = userId
//         ? `rate_limit:user:${userId}:${resource}`
//         : `rate_limit:ip:${req.ip}:${resource}`;

//       const result = await checkRateLimit(
//         key,
//         limit,
//         windowInSeconds
//       );

//       res.setHeader("X-RateLimit-Limit", limit);
//       res.setHeader(
//         "X-RateLimit-Remaining",
//         result.remaining
//       );

//       if (!result.allowed) {
//         res.setHeader(
//           "Retry-After",
//           result.retryAfter
//         );

//         return res.status(429).json({
//           status: "fail",
//           message: "Too many requests. Please try again later.",
//           retryAfter: result.retryAfter,
//         });
//       }

//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };

// sliding windlow midle ware

import { checkSlidingRateLimitAtomic } from "../service/slidingRateLimitAtomic.service.js";

export const rateLimitMiddleware = (
  resource,
  limit = 100,
  windowInSeconds = 60
) => {
  return async (req, res, next) => {
    try {
      const userId = req.loginUser?._id?.toString();

      const key = userId
        ? `rate_limit:user:${userId}:${resource}`
        : `rate_limit:ip:${req.ip}:${resource}`;

      const result = await checkSlidingRateLimitAtomic(
        key,
        limit,
        windowInSeconds
      );

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", result.remaining);

      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfter);

        return res.status(429).json({
          status: "fail",
          message: "Too many requests. Please try again later.",
          retryAfter: result.retryAfter,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
