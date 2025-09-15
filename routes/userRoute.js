import express from "express";

import {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  changeLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} from "../utils/validators/userValidator.js";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  changeLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserAccount,
} from "../services/userService.js";

import { protect, allowedTo } from "../services/authService.js";

const router = express.Router();

router.get("/me", protect, getLoggedUserData, getUserById); // GET /api/v1/users/me
router.put(
  "/changeMyPassword",
  protect,
  changeLoggedUserPasswordValidator,
  changeLoggedUserPassword
); // PUT /api/v1/users/changeMyPassword

router.put(
  "/updateMe",
  protect,
  uploadUserImage,
  resizeImage,
  updateLoggedUserValidator,
  updateLoggedUserData
); // PUT /api/v1/users/updateMe

router.delete("/deleteMe", protect, deleteLoggedUserAccount); // DELETE /api/v1/users/deleteMe

// Protect all routes after this middleware to be private and for admin only
router.use(protect, allowedTo("admin"));

router
  .route("/:id/changePassword")
  .put(changeUserPasswordValidator, changeUserPassword); // PUT /api/v1/users/:id/changePassword

router
  .route("/")
  .get(getUsers) // GET /api/v1/users
  .post(uploadUserImage, resizeImage, createUserValidator, createUser); // POST /api/v1/users

router
  .route("/:id")
  .get(getUserValidator, getUserById) // GET /api/v1/users/:id
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser) // PUT /api/v1/users/:id
  .delete(deleteUserValidator, deleteUser); // DELETE /api/v1/users/:id

export default router;
