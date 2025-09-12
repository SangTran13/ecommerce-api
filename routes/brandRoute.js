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

const router = express.Router();

// Define routes for getting all brands and creating a new brand
router.route("/").get(getBrands).post(createBrandValidator, createBrand);
router
  .route("/:id")
  .get(getBrandValidator, getBrandById)
  .put(updateBrandValidator, updateBrand)
  .delete(deleteBrandValidator, deleteBrand);

export default router;
