import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";
import ApiError from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";
import qs from "qs";
import { createOne, updateOne, deleteOne } from "./handlersFactory.js";

// @description Get all categories
// @route GET /api/v1/categories?page=...&limit=...
// @access Public
export const getCategories = asyncHandler(async (req, res) => {
  // Parse query string to nested object
  const query = qs.parse(req._parsedUrl.query);

  const countApiFeatures = new ApiFeatures(Category.find(), query)
    .filter()
    .searchByKeyword();

  const documentsCount = await countApiFeatures.mongoQuery.countDocuments();

  const apiFeatures = new ApiFeatures(Category.find().lean(), query)
    .filter()
    .searchByKeyword()
    .paginate(documentsCount)
    .limitFields()
    .sort();

  // Execute query
  const { mongoQuery, paginationResult } = apiFeatures;
  const categories = await mongoQuery;

  res.status(200).json({
    success: true,
    results: categories.length,
    pagination: paginationResult,
    categories,
  });
});

// @desc Get specific category by ID
// @route GET /api/v1/categories/:id
// @access Public
export const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).lean();
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  res.status(200).json({
    success: true,
    category,
  });
});

// @description Create a new category
// @route POST /api/v1/categories
// @access Public
export const createCategory = createOne(Category);

// @desc Update specific category by ID
// @route PUT /api/v1/categories/:id
// @access Public
export const updateCategory = updateOne(Category);
// @desc Delete specific category by ID
// @route DELETE /api/v1/categories/:id
// @access Public
export const deleteCategory = deleteOne(Category);