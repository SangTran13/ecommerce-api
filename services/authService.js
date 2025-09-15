import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createToken, createTokenPair } from "../utils/createToken.js";
import bcrypt from "bcryptjs";

import asyncHandler from "express-async-handler";

import ApiError from "../utils/apiError.js";

import sendEmail from "../utils/sendEmail.js";

import User from "../models/userModel.js";
import {
  isTokenBlacklisted,
  isUserBlacklisted,
  blacklistToken,
  blacklistUser,
  removeUserFromBlacklist,
} from "../utils/tokenBlacklist.js";

// @desc    Signup
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res, _next) => {
  // Create user
  const user = await User.create(req.body);

  // Create token pair (access token + refresh token)
  const tokens = await createTokenPair(user);

  // Send response
  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenExpires: tokens.accessTokenExpires,
  });
});

// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // no need check because we have validatorMiddleware
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  if (!user.isActive) {
    return next(
      new ApiError("User is not active. Please contact support.", 403)
    );
  }

  await removeUserFromBlacklist(user._id.toString());

  // Create token pair (access token + refresh token)
  const tokens = await createTokenPair(user);

  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    data: user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenExpires: tokens.accessTokenExpires,
  });
});

// @desc   Protect routes - only logged in users can access
// @route  ANY
// @access Private
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Handle case where token is 'null' string (from Postman environment issue)
  if (token === "null" || token === "undefined") {
    token = null;
  }
  if (!token) {
    return next(
      new ApiError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if token is blacklisted
  const tokenBlacklisted = await isTokenBlacklisted(token);
  if (tokenBlacklisted) {
    return next(
      new ApiError("Token has been invalidated. Please log in again.", 401)
    );
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // Check if user is blacklisted (admin kicked user)
  const userBlacklisted = await isUserBlacklisted(currentUser._id.toString());
  if (userBlacklisted) {
    return next(
      new ApiError(
        "Your account has been temporarily suspended. Please contact support.",
        401
      )
    );
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new ApiError("User recently changed password! Please log in again.", 401)
    );
  }

  if (!currentUser.isActive) {
    return next(
      new ApiError("User is not active. Please contact support.", 403)
    );
  }
  // Grant access to protected route
  req.user = currentUser;
  next();
});

// @desc   Restrict to specific roles
// @route  ANY
// @access Private
export const allowedTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to perform this action", 403)
      );
    }
    next();
  };

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ApiError("There is no user with that email", 404));
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  // Send reset code to user's email

  const message = `Hi ${user.name},\n\nYour password reset code is: ${resetCode}\n\nThis code is valid for 10 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nSang Company Name`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code (valid for 10 minutes)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(
      new ApiError("There was an error sending the email. Try again later.")
    );
  }
  res.status(200).json({
    status: "success",
    message: "Password reset code sent to email",
  });
});

// @desc    Verify reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public

export const verifyResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Invalid or expired reset code", 400));
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Reset code verified successfully",
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError("There is no user with that email", 404));
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  const token = createToken(user);

  res.status(200).json({
    status: "success",
    token,
  });
});

// @desc Refresh token
// @route POST /api/v1/auth/refreshToken
// @access Public
export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ApiError("Refresh token is required", 400));
  }

  // Find user by refresh token
  const user = await User.findOne({
    refreshToken,
    refreshTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Invalid or expired refresh token", 401));
  }

  // Create new token pair
  const tokens = await createTokenPair(user);

  res.status(200).json({
    status: "success",
    message: "Token refreshed successfully",
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenExpires: tokens.accessTokenExpires,
  });
});

// @desc Logout
// @route POST /api/v1/auth/logout
// @access Private
export const logout = asyncHandler(async (req, res, next) => {
  // Get current token from request
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Blacklist current token
  if (token) {
    await blacklistToken(token);
  }

  // Clear refresh token from user
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = undefined;
    user.refreshTokenExpires = undefined;
    await user.save();
  }

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

// @desc Kick user (Admin only)
// @route POST /api/v1/auth/kick-user/:userId
// @access Private/Admin
export const kickUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Find user to kick
  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  // Can't kick yourself
  if (userId === req.user._id.toString()) {
    return next(new ApiError("Cannot kick yourself", 400));
  }

  const blacklisted = await blacklistUser(userId);

  // Clear refresh token
  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: `User ${user.name} kicked - must login again to access`,
    blacklisted: blacklisted,
  });
});
