import express from "express";

import {
  getSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../services/subCategoryService.js";

import {
  getSubCategoryValidator,
  createSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator
} from "../utils/validators/subCategoryValidator.js";

const router = express.Router();

router
  .route("/")
  .get(getSubCategories)
  .post(createSubCategoryValidator, createSubCategory);
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategoryById)
  .put(updateSubCategoryValidator, updateSubCategory)
  .delete(deleteSubCategoryValidator, deleteSubCategory);

export default router;
