import slugify from "slugify";
import { check, body } from "express-validator";

import validatorMiddleware from "../../middlewares/validatorMiddleware.js";

import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";

export const signupValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Name must be at most 32 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        return Promise.reject(new Error("E-mail already in use"));
      }
    }),
  body("slug")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(req.body.name);
      return true;
    }),
  body("phone")
    .optional()
    .isMobilePhone("vi-VN")
    .withMessage("Invalid phone number"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  validatorMiddleware,
];

export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  validatorMiddleware,
];

export const forgotPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (!user) {
        return Promise.reject(new Error("E-mail not found"));
      }
      return true;
    }),
  validatorMiddleware,
];

export const verifyResetCodeValidator = [
  body("resetCode")
    .notEmpty()
    .withMessage("Reset code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be 6 numeric characters")
    .isNumeric()
    .withMessage("Reset code must be numeric"),
  validatorMiddleware,
];

export const resetPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (!user) {
        return Promise.reject(new Error("E-mail not found"));
      }
      return true;
    }),
  body("newPassword")
    .notEmpty()
    .withMessage(" New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password");
      }
      return true;
    }),
  validatorMiddleware,
];

export const refreshTokenValidator = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required")
    .isLength({ min: 64, max: 64 })
    .withMessage("Invalid refresh token format"),
  validatorMiddleware,
];