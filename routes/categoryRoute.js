import express from "express";
import {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  getSubCategoriesByCategoryValidator,
  deleteSubCategoriesByCategoryValidator,
} from "../utils/validators/categoryValidator.js";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategoriesByCategory,
  deleteSubCategoriesByCategory,
} from "../services/categoryService.js";

const router = express.Router();

// Define routes for getting all categories and creating a new category
router
  .route("/")
  .get(getCategories)
  .post(createCategoryValidator, createCategory);
router
  .route("/:id")
  .get(getCategoryValidator, getCategoryById)
  .put(updateCategoryValidator, updateCategory)
  .delete(deleteCategoryValidator, deleteCategory);

router
  .route("/:categoryId/sub-categories")
  .get(getSubCategoriesByCategoryValidator, getSubCategoriesByCategory)
  .delete(
    deleteSubCategoriesByCategoryValidator,
    deleteSubCategoriesByCategory
  );

export default router;
