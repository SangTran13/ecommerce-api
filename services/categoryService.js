import Category from "../models/categoryModel.js";

import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "./handlersFactory.js";

// @description Get all categories
// @route GET /api/v1/categories?page=...&limit=...
// @access Public
export const getCategories = getAll(Category, "Category");

// @desc Get specific category by ID
// @route GET /api/v1/categories/:id
// @access Public
export const getCategoryById = getOne(Category);

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
