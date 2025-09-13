import Brand from "../models/brandModel.js";

import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "./handlersFactory.js";

// @description Get all brands
// @route GET /api/v1/brands?page=...&limit=...
// @access Public
export const getBrands = getAll(Brand, "Brand");

// @desc Get specific brand by ID
// @route GET /api/v1/brands/:id
// @access Public
export const getBrandById = getOne(Brand);

// @description Create a new brand
// @route POST /api/v1/brands
// @access Public
export const createBrand = createOne(Brand);

// @desc Update specific brand by ID
// @route PUT /api/v1/brands/:id
// @access Public
export const updateBrand = updateOne(Brand);

// @desc Delete specific brand by ID
// @route DELETE /api/v1/brands/:id
// @access Public
export const deleteBrand = deleteOne(Brand);
