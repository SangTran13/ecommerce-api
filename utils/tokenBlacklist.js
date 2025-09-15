import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";

// Blacklist token
export const blacklistToken = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      const ttl = decoded.exp - now;
      if (ttl > 0) {
        await Promise.race([
          redisClient.setEx(`token:${token}`, ttl, "1"),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Redis timeout")), 1000)
          ),
        ]);
      }
    }
    return true;
  } catch (error) {
    return false; // Silent fail
  }
};

// Check if token is blacklisted
export const isTokenBlacklisted = async (token) => {
  try {
    const result = await Promise.race([
      redisClient.get(`token:${token}`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis timeout")), 500)
      ),
    ]);
    return result !== null;
  } catch (error) {
    return false; // Fail-safe: allow token if Redis error
  }
};

// Blacklist user
export const blacklistUser = async (userId, duration = 3600) => {
  try {
    await Promise.race([
      redisClient.setEx(`user:${userId}`, duration, "1"),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis timeout")), 1000)
      ),
    ]);
    return true;
  } catch (error) {
    return false; // Silent fail - Redis not available
  }
};

// Check if user is blacklisted
export const isUserBlacklisted = async (userId) => {
  try {
    const result = await Promise.race([
      redisClient.get(`user:${userId}`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis timeout")), 500)
      ),
    ]);
    return result !== null;
  } catch (error) {
    return false; // Fail-safe: allow user if Redis error
  }
};

// Remove user from blacklist (unblock user)
export const removeUserFromBlacklist = async (userId) => {
  try {
    await Promise.race([
      redisClient.del(`user:${userId}`),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis timeout")), 500)
      ),
    ]);
    return true;
  } catch (error) {
    return false; // Silent fail
  }
};
