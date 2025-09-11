import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";

const getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID format"),
  validatorMiddleware,
];

const createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Category name must be between 3 and 50 characters"),
  validatorMiddleware,
];

const updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID format"),
  check("name")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Category name must be between 3 and 50 characters"),
  validatorMiddleware,
];

const deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID format"),
  validatorMiddleware,
];

const getSubCategoriesByCategoryValidator = [
  check("categoryId").isMongoId().withMessage("Invalid category ID format"),
  validatorMiddleware,
];

const deleteSubCategoriesByCategoryValidator = [
  check("categoryId").isMongoId().withMessage("Invalid category ID format"),
  validatorMiddleware,
];

export {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  getSubCategoriesByCategoryValidator,
  deleteSubCategoriesByCategoryValidator
};
