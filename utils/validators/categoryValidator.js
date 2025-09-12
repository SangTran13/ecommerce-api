import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";
import Category from "../../models/categoryModel.js";
import slugify from "slugify";
import ApiError from "../apiError.js";

const getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID format"),
  validatorMiddleware,
];

const createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Category name must be between 3 and 50 characters")
    .custom(async (value) => {
      const category = await Category.findOne({
        $or: [{ slug: slugify(value) }, { name: value }],
      });
      if (category) {
        return Promise.reject(new Error("Category name already exists"));
      }
    }),
  validatorMiddleware,
];

const updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID format"),
  async (req, _res, next) => {
    const category = await Category.findById(req.params.id).select("slug");
    if (!category) {
      return next(new ApiError("Category not found", 404));
    }
    req.category = category;
    next();
  },
  check("name")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Category name must be between 3 and 50 characters")
    .custom(async (value, { req }) => {
      if (!value) return true;
      const dup = await Category.findOne({
        $or: [{ slug: slugify(value) }, { name: value }],
        _id: { $ne: req.params.id },
      });
      if (dup) {
        return Promise.reject(new Error("Category name already exists"));
      }
      return true;
    }),
  validatorMiddleware,
];

const deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category ID format"),
  validatorMiddleware,
];

export {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
};
