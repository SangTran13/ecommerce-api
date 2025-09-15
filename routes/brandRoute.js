import express from "express";

import {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} from "../utils/validators/brandValidator.js";

import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../services/brandService.js";

import { protect, allowedTo } from "../services/authService.js";

const router = express.Router();

// Define routes for getting all brands and creating a new brand
router
  .route("/")
  .get(getBrands)
  .post(
    protect,
    allowedTo("admin", "manager"),
    createBrandValidator,
    createBrand
  );

// Define routes for getting, updating, and deleting a specific brand by ID
router
  .route("/:id")
  .get(getBrandValidator, getBrandById)
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateBrandValidator,
    updateBrand
  )
  .delete(protect, allowedTo("admin"), deleteBrandValidator, deleteBrand);

// Export the router
export default router;
