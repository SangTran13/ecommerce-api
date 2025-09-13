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

// Merge params to access categoryId from parent route
const router = express.Router({ mergeParams: true });

// Define routes for getting all sub-categories and creating a new sub-category
router
  .route("/")
  .get(getSubCategoriesByCategory, getSubCategories)
  .post(setCategoryIdToBody, createSubCategoryValidator, createSubCategory)
  .delete(
    deleteSubCategoriesByCategoryValidator,
    deleteSubCategoriesByCategory
  );

// Define routes for getting, updating, and deleting a specific sub-category by ID
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategoryById)
  .put(updateSubCategoryValidator, updateSubCategory)
  .delete(deleteSubCategoryValidator, deleteSubCategory);

// Export the router
export default router;
