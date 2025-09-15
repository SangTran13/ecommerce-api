import asyncHandler from "express-async-handler";
import { createToken } from "../utils/createToken.js";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import fs from "fs";
import ApiError from "../utils/apiError.js";

import { getAll, getOne, createOne, deleteOne } from "./handlersFactory.js";

import { uploadSingleImage } from "../middlewares/uploadImageMiddleware.js";

import User from "../models/userModel.js";

export const uploadUserImage = uploadSingleImage("profileImg");

export const resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    // Ensure the uploads/users directory exists
    const uploadDir = "uploads/users";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process the image
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // Save image filename to req.body to be used in createUser and updateUser
    req.body.profileImg = filename;
  }

  next();
});

// @desc Get all users
// @route GET /api/v1/users?page=...&limit=...
// @access Private/Admin
export const getUsers = getAll(User, "User");

// @desc Get specific user by ID
// @route GET /api/v1/users/:id
// @access Private/Admin
export const getUserById = getOne(User);

// @desc Create a new user
// @route POST /api/v1/users
// @access Private/Admin
export const createUser = createOne(User);

// @desc Update specific user by ID
// @route PUT /api/v1/users/:id
// @access Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(
      new ApiError(`No user found for this id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: user,
  });
});

// @desc Change specific user password
// @route PUT /api/v1/users/:id/changePassword
// @access Private/Admin
export const changeUserPassword = asyncHandler(async (req, res, _next) => {
  const user = await User.findById(req.params.id);

  user.password = req.body.password;
  user.passwordChangedAt = new Date(Date.now() - 5000);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "User password updated successfully",
    data: user,
  });
});

// @desc Delete specific user by ID
// @route DELETE /api/v1/users/:id
// @access Private/Admin
export const deleteUser = deleteOne(User);

// @desc Get logged in user data
// @route GET /api/v1/users/me
// @access Private
export const getLoggedUserData = asyncHandler(async (req, _res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc Update logged in user password
// @route PUT /api/v1/users/changeMyPassword
// @access Private
export const changeLoggedUserPassword = asyncHandler(
  async (req, res, _next) => {
    const user = await User.findById(req.user._id);

    user.password = req.body.password;
    user.passwordChangedAt = new Date(Date.now() - 5000);
    await user.save();

    // Create token
    const token = createToken(user);

    // Send response
    res.status(200).json({
      status: "success",
      message: "User password updated successfully",
      token,
    });
  }
);

// @desc Update logged in user data
// @route PUT /api/v1/users/updateMe
// @access Private
export const updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      profileImg: req.body.profileImg,
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ApiError(`No user found for this id ${req.user._id}`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "User data updated successfully",
    data: user,
  });
});

// @desc Deactivate logged in user account
// @route DELETE /api/v1/users/deleteMe
// @access Private
export const deleteLoggedUserAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { isActive: false });

  if (!user) {
    return next(new ApiError(`No user found for this id ${req.user._id}`, 404));
  }

  res.status(200).json({
    status: "success",
    message: "User account deleted successfully",
  });
});
