import jwt from "jsonwebtoken";

// Access Token
export const getAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.ACCESS_SECRET_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_TIME || "15m" }
  );
};

// Refresh Token
export const getRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.REFRESH_SECRET_KEY,
    { expiresIn: process.env.REFRESH_TOKEN_TIME || "7d" }
  );
};

export const verifyRefreshTOken = (token) => {
  return jwt.verify(
    token,
    process.env.REFRESH_SECRET_KEY,
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(
    token,
    process.env.ACCESS_SECRET_KEY,
  );
};


// Cookie Options
export const getCookiesPayload = () => {
  return {
    httpOnly: true,
    secure: false, 
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * parseInt(process.env.MAX_AGE || "7"),
  };
};
