import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";

const getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid sub-category ID format"),
  validatorMiddleware,
];

const createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Sub-category name is required")
    .isLength({ min: 2, max: 32 })
    .withMessage("Sub-category name must be between 2 and 32 characters"),
  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID format"),
  validatorMiddleware,
];

const updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid sub-category ID format"),
  ...createSubCategoryValidator,
];

const deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid sub-category ID format"),
  validatorMiddleware,
];

export {
  getSubCategoryValidator,
  createSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator
};
