import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";

import Category from "../models/categoryModel.js";
import SubCategory from "../models/subCategoryModel.js";
import ApiFeatures from "../utils/apiFeatures.js";
import qs from "qs";
import { createOne, updateOne, deleteOne } from "./handlersFactory.js";

export const setCategoryIdToBody = (req, res, next) => {
  // If the request is coming from a nested route, set the category from params
  if (!req.body.category && req.params.categoryId) {
    req.body.category = req.params.categoryId;
  }
  next();
};

// Nested route - to get subCategories by category ID
// GET /api/v1/categories/:categoryId/sub-categories
export const getSubCategoriesByCategory = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObject = filterObject;
  next();
};

// @description Get all subCategories
// @route GET /api/v1/sub-categories?page=...&limit=...
// @access Public
export const getSubCategories = asyncHandler(async (req, res) => {
  // Parse query string to nested object
  const query = qs.parse(req._parsedUrl.query);

  const countApiFeatures = new ApiFeatures(
    SubCategory.find(req.filterObject),
    query
  )
    .filter()
    .searchByKeyword("SubCategory");

  const documentsCount = await countApiFeatures.mongoQuery.countDocuments();

  const apiFeatures = new ApiFeatures(
    SubCategory.find(req.filterObject).populate("category", "name").lean(),
    query
  )
    .filter()
    .searchByKeyword("SubCategory")
    .paginate(documentsCount)
    .limitFields()
    .sort();

  // Execute query
  const { mongoQuery, paginationResult } = apiFeatures;
  const subCategories = await mongoQuery;

  res.status(200).json({
    success: true,
    results: subCategories.length,
    pagination: paginationResult,
    subCategories,
  });
});

// @desc Get specific subCategory by ID
// @route GET /api/v1/sub-categories/:id
// @access Public
export const getSubCategoryById = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id)
    .populate("category", "name -_id")
    .lean();
  if (!subCategory) {
    return next(new ApiError("SubCategory not found", 404));
  }
  res.status(200).json({
    success: true,
    subCategory,
  });
});

// @desc Create a new subCategory
// @route POST /api/v1/sub-categories
// @access Public
export const createSubCategory = createOne(SubCategory);

// @desc Update specific subCategory by ID
// @route PUT /api/v1/sub-categories/:id
// @access Public
export const updateSubCategory = updateOne(SubCategory);

// @desc Delete specific subCategory by ID
// @route DELETE /api/v1/sub-categories/:id
// @access Public
export const deleteSubCategory = deleteOne(SubCategory);

// @desc Delete all sub categories by category ID
// @route DELETE /api/v1/categories/:categoryId/sub-categories
// @access Public
export const deleteSubCategoriesByCategory = asyncHandler(
  async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const categoryExists = await Category.findById(categoryId).lean();
    if (!categoryExists) {
      return next(new ApiError("Category not found", 404));
    }
    const result = await SubCategory.deleteMany({ category: categoryId });
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} sub-categories deleted successfully`,
    });
  }
);
