import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET || "";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "";

export const signAccessToken = (payload) => {
  return jwt.sign(payload, accessSecret, { expiresIn: "15m" });
};

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, refreshSecret, { expiresIn: "7d" });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, accessSecret);
  } catch (e) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, refreshSecret);
  } catch (e) {
    return null;
  }
};

// For OAuth state parameter
export const signStateToken = (payload) => {
  return jwt.sign(payload, accessSecret, { expiresIn: "10m" });
};
export const verifyStateToken = (token) => {
  try {
    return jwt.verify(token, accessSecret);
  } catch (e) {
    return null;
  }
};