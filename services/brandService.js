import asyncHandler from "express-async-handler";
import Brand from "../models/brandModel.js";
import ApiError from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";
import qs from "qs";
import { createOne, updateOne, deleteOne } from "./handlersFactory.js";

// @description Get all brands
// @route GET /api/v1/brands?page=...&limit=...
// @access Public
export const getBrands = asyncHandler(async (req, res) => {
  // Parse query string to nested object
  const query = qs.parse(req._parsedUrl.query);

  const countApiFeatures = new ApiFeatures(Brand.find(), query)
    .filter()
    .searchByKeyword("Brand");

  const documentsCount = await countApiFeatures.mongoQuery.countDocuments();

  const apiFeatures = new ApiFeatures(Brand.find().lean(), query)
    .filter()
    .searchByKeyword("Brand")
    .paginate(documentsCount)
    .limitFields()
    .sort();

  // Execute query
  const { mongoQuery, paginationResult } = apiFeatures;
  const brands = await mongoQuery;
  res.status(200).json({
    success: true,
    results: brands.length,
    pagination: paginationResult,
    brands,
  });
});

// @desc Get specific brand by ID
// @route GET /api/v1/brands/:id
// @access Public
export const getBrandById = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id).lean();
  if (!brand) {
    return next(new ApiError("Brand not found", 404));
  }
  res.status(200).json({
    success: true,
    brand,
  });
});

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