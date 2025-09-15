import express from "express";

import {
  getSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  getSubCategoriesByCategory,
  deleteSubCategoriesByCategory,
} from "../services/subCategoryService.js";

import {
  getSubCategoryValidator,
  createSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
  deleteSubCategoriesByCategoryValidator,
} from "../utils/validators/subCategoryValidator.js";

import { protect, allowedTo } from "../services/authService.js";

// Merge params to access categoryId from parent route
const router = express.Router({ mergeParams: true });

// Define routes for getting all sub-categories and creating a new sub-category
router
  .route("/")
  .get(getSubCategoriesByCategory, getSubCategories)
  .post(
    protect,
    allowedTo("admin", "manager"),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteSubCategoriesByCategoryValidator,
    deleteSubCategoriesByCategory
  );

// Define routes for getting, updating, and deleting a specific sub-category by ID
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategoryById)
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

// Export the router
export default router;
