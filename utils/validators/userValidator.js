import slugify from "slugify";
import { check, body } from "express-validator";

import validatorMiddleware from "../../middlewares/validatorMiddleware.js";

import User from "../../models/userModel.js";
import bcrypt from "bcryptjs";

// Validator for user ID parameter
export const getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

// Validator for creating a new user
export const createUserValidator = [
  body("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .isLength({ max: 32 })
    .withMessage("Too long User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in use"));
        }
      })
    ),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),

  body("phone")
    .optional()
    .isMobilePhone("vi-VN")
    .withMessage("Invalid phone number"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin"),
  validatorMiddleware,
];

// Validator for updating an existing user
export const updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .isLength({ max: 32 })
    .withMessage("Too long User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val, { req }) =>
      User.findOne({ email: val }).then((user) => {
        if (user && user._id.toString() !== req.params.id) {
          return Promise.reject(new Error("E-mail already in use"));
        }
      })
    ),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin"),
  validatorMiddleware,
];

export const changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  body("currentPassword").custom(async (val, { req }) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error("There is no user for this id");
    }
    const isCorrectPassword = await bcrypt.compare(val, user.password);
    if (!isCorrectPassword) {
      throw new Error("Incorrect current password");
    }
    return true;
  }),
  validatorMiddleware,
];

// Validator for deleting a user
export const deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

export const changeLoggedUserPasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  body("currentPassword").custom(async (val, { req }) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new Error("There is no user for this id");
    }
    const isCorrectPassword = await bcrypt.compare(val, user.password);
    if (!isCorrectPassword) {
      throw new Error("Incorrect current password");
    }
    return true;
  }),
  validatorMiddleware,
];

export const updateLoggedUserValidator = [
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .isLength({ max: 32 })
    .withMessage("Too long User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body("phone")
    .optional()
    .isMobilePhone("vi-VN")
    .withMessage("Invalid phone number"),
  validatorMiddleware,
];
