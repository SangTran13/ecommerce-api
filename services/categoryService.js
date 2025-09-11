import slugify from "slugify";
import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";
import ApiError from "../utils/apiError.js";

// @description Get all categories
// @route GET /api/v1/categories?page=...&limit=...
// @access Public
export const getCategories = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const categories = await Category.find({}).skip(skip).limit(limit).lean();
  res.status(200).json({
    success: true,
    results: categories.length,
    page,
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
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, image } = req.body;
  
  const existingCategory = await Category.findOne({ name }).lean();
  if (existingCategory) {
    return next(new ApiError("Category name already exists", 400));
  }

  const newCategory = new Category({ name, slug: slugify(name), image });
  await newCategory.save();
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category: newCategory,
  });
});

// @desc Update specific category by ID
// @route PUT /api/v1/categories/:id
// @access Public
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, image } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }

  const existingCategory = await Category.findOne({ name }).lean();
  if (existingCategory && existingCategory._id.toString() !== req.params.id) {
    return next(new ApiError("Category name already exists", 400));
  }

  category.name = name;
  category.image = image;
  category.slug = slugify(name);
  category.updatedAt = Date.now();
  await category.save();
  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category,
  });
});

// @desc Delete specific category by ID
// @route DELETE /api/v1/categories/:id
// @access Public
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new ApiError("Category not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
