import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";
import Category from "../../models/categoryModel.js";
import SubCategory from "../../models/subCategoryModel.js";
import slugify from "slugify";
import ApiError from "../apiError.js";

const getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid sub-category ID format"),
  validatorMiddleware,
];

const createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Sub-category name is required")
    .isLength({ min: 2, max: 32 })
    .withMessage("Sub-category name must be between 2 and 32 characters")
    .custom((value, { req }) =>
      SubCategory.findOne({ slug: slugify(value), category: req.body.category }).then(
        (sub) => {
          if (sub) {
            return Promise.reject(new Error("SubCategory already exists"));
          }
        }
      )
    ),
  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(new Error("Category not found"));
        }
      })
    ),
  validatorMiddleware,
];

const updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid sub-category ID format"),
  async (req, _res, next) => {
    const sub = await SubCategory.findById(req.params.id).select("category slug");
    if (!sub) {
      return next(new ApiError("SubCategory not found", 404));
    }
    req.subCategory = sub;
    next();
  },
  check("name")
    .optional()
    .isLength({ min: 2, max: 32 })
    .withMessage("Sub-category name must be between 2 and 32 characters")
    .custom((value, { req }) => {
      const categoryId = req.body.category || (req.subCategory && req.subCategory.category);
      if (!categoryId) return true;
      return SubCategory.findOne({ slug: slugify(value), category: categoryId }).then(
        (sub) => {
          if (sub && sub._id.toString() !== req.params.id) {
            return Promise.reject(new Error("SubCategory already exists"));
          }
        }
      );
    }),
  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(new Error("Category not found"));
        }
      })
    ),
  validatorMiddleware,
];

const deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid sub-category ID format"),
  validatorMiddleware,
];

const deleteSubCategoriesByCategoryValidator = [
  check("categoryId").isMongoId().withMessage("Invalid category ID format"),
  validatorMiddleware,
];

export {
  getSubCategoryValidator,
  createSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
  deleteSubCategoriesByCategoryValidator,
};
