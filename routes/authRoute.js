import express from "express";

import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
  refreshTokenValidator,
} from "../utils/validators/authValidator.js";

import {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  refreshToken,
  logout,
  protect,
  allowedTo,
  kickUser,
} from "../services/authService.js";

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);
router.post("/verifyResetCode", verifyResetCodeValidator, verifyResetCode);
router.post("/resetPassword", resetPasswordValidator, resetPassword);
router.post("/refreshToken", refreshTokenValidator, refreshToken);
router.post("/logout", protect, logout);
router.post("/kick-user/:userId", protect, allowedTo("admin"), kickUser);

export default router;
