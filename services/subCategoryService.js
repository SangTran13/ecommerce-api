import slugify from "slugify";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";

import Category from "../models/categoryModel.js";
import SubCategory from "../models/subCategoryModel.js";

// @description Get all subCategories
// @route GET /api/v1/sub-categories?page=...&limit=...
// @access Public

export const getSubCategories = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const subCategories = await SubCategory.find({})
    .skip(skip)
    .limit(limit)
    .populate({
      path: "category",
      select: "name -_id",
    })
    .lean();
  res.status(200).json({
    success: true,
    results: subCategories.length,
    page,
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
export const createSubCategory = asyncHandler(async (req, res, next) => {
  const { name, category } = req.body;

  const existingSubCategory = await SubCategory.findOne({
    name,
    category,
  }).lean();
  if (existingSubCategory) {
    return next(new ApiError("SubCategory already exists", 400));
  }

  const categoryExists = await Category.findById(category).lean();
  if (!categoryExists) {
    return next(new ApiError("Category not found", 404));
  }

  const subCategory = await SubCategory.create({
    name,
    slug: slugify(name),
    category,
  });
  res.status(201).json({
    success: true,
    subCategory,
  });
});

// @desc Update specific subCategory by ID
// @route PUT /api/v1/sub-categories/:id
// @access Public
export const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { name, category } = req.body;

  const subCategory = await SubCategory.findById(req.params.id);
  if (!subCategory) {
    return next(new ApiError("SubCategory not found", 404));
  }

  const categoryExists = await Category.findById(category).lean();
  if (!categoryExists) {
    return next(new ApiError("Category not found", 404));
  }

  const existingSubCategory = await SubCategory.findOne({
    name,
    category,
  }).lean();
  if (
    existingSubCategory &&
    existingSubCategory._id.toString() !== req.params.id
  ) {
    return next(new ApiError("SubCategory already exists", 400));
  }

  subCategory.name = name;
  subCategory.slug = slugify(name);
  subCategory.category = category;
  subCategory.updatedAt = Date.now();
  await subCategory.save();
  res.status(200).json({
    success: true,
    subCategory,
  });
});

// @desc Delete specific subCategory by ID
// @route DELETE /api/v1/sub-categories/:id
// @access Public
export const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
  if (!subCategory) {
    return next(new ApiError("SubCategory not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "SubCategory deleted successfully",
  });
});
