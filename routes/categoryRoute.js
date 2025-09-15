import express from "express";

import {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} from "../utils/validators/categoryValidator.js";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService.js";

import { protect, allowedTo } from "../services/authService.js";

import subCategoriesRoute from "./subCategoryRoute.js";

const router = express.Router();

// Nested route for sub-categories under a specific category
router.use("/:categoryId/sub-categories", subCategoriesRoute);

// Define routes for getting all categories and creating a new category
router
  .route("/")
  .get(getCategories)
  .post(
    protect,
    allowedTo("admin", "manager"),
    createCategoryValidator,
    createCategory
  );

// Define routes for getting, updating, and deleting a specific category by ID
router
  .route("/:id")
  .get(getCategoryValidator, getCategoryById)
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateCategoryValidator,
    updateCategory
  )
  .delete(protect, allowedTo("admin"), deleteCategoryValidator, deleteCategory);

// Export the router
export default router;
