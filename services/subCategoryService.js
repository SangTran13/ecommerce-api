import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";

import Category from "../models/categoryModel.js";
import SubCategory from "../models/subCategoryModel.js";

import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "./handlersFactory.js";

// Middleware to set category ID to body if not provided
export const setCategoryIdToBody = (req, _res, next) => {
  // If the request is coming from a nested route, set the category from params
  if (!req.body.category && req.params.categoryId) {
    req.body.category = req.params.categoryId;
  }
  next();
};

// Nested route - to get subCategories by category ID
// GET /api/v1/categories/:categoryId/sub-categories
export const getSubCategoriesByCategory = (req, _res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObject = filterObject;
  next();
};

// @description Get all subCategories
// @route GET /api/v1/sub-categories?page=...&limit=...
// @access Public
export const getSubCategories = getAll(SubCategory, "SubCategory", {
  populate: { path: "category", select: "name -_id" },
});

// @desc Get specific subCategory by ID
// @route GET /api/v1/sub-categories/:id
// @access Public
export const getSubCategoryById = getOne(SubCategory, {
  populate: { path: "category", select: "name -_id" },
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
