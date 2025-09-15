import jwt from "jsonwebtoken";
import { createRefreshToken, createRefreshTokenExpires } from "./createRefreshToken.js";

// Create access token
export const createToken = (user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

// Create token pair (access token + refresh token)
export const createTokenPair = async (user) => {
  // Create access token
  const accessToken = createToken(user);
  
  // Create refresh token
  const refreshToken = createRefreshToken();
  const refreshTokenExpires = createRefreshTokenExpires();
  
  // Save refresh token to user
  user.refreshToken = refreshToken;
  user.refreshTokenExpires = refreshTokenExpires;
  await user.save();
  
  return {
    accessToken,
    refreshToken,
    accessTokenExpires: process.env.JWT_EXPIRES_IN,
    refreshTokenExpires: refreshTokenExpires,
  };
};
