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

router
  .route("/")
  .get(getSubCategoriesByCategory, getSubCategories)
  .post(setCategoryIdToBody, createSubCategoryValidator, createSubCategory)
  .delete(
    deleteSubCategoriesByCategoryValidator,
    deleteSubCategoriesByCategory
  );
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategoryById)
  .put(updateSubCategoryValidator, updateSubCategory)
  .delete(deleteSubCategoryValidator, deleteSubCategory);

export default router;
