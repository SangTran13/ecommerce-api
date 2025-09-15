import crypto from "crypto";

// Create refresh token
export const createRefreshToken = () => {
  // Generate a random 32-byte string and convert to hex
  const refreshToken = crypto.randomBytes(32).toString('hex');
  return refreshToken;
};

// Create refresh token expiration date (30 days from now)
export const createRefreshTokenExpires = () => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30); // 30 days
  return expires;
};
