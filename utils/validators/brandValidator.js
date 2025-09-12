import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";
import slugify from "slugify";
import Brand from "../../models/brandModel.js";
import ApiError from "../apiError.js";

const getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand ID format"),
  validatorMiddleware,
];

const createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Brand name must be between 3 and 50 characters")
    .custom(async (value) => {
      const brand = await Brand.findOne({
        $or: [{ slug: slugify(value) }, { name: value }],
      });
      if (brand) {
        return Promise.reject(new Error("Brand name already exists"));
      }
    }),
  validatorMiddleware,
];

const updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand ID format"),
  async (req, _res, next) => {
    const brand = await Brand.findById(req.params.id).select("slug name");
    if (!brand) {
      return next(new ApiError("Brand not found", 404));
    }
    req.brand = brand;
    next();
  },
  check("name")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Brand name must be between 3 and 50 characters")
    .custom(async (value, { req }) => {
      if (!value) return true;
      const dup = await Brand.findOne({
        $or: [{ slug: slugify(value) }, { name: value }],
        _id: { $ne: req.params.id },
      });
      if (dup) {
        return Promise.reject(new Error("Brand name already exists"));
      }
      return true;
    }),
  validatorMiddleware,
];

const deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand ID format"),
  validatorMiddleware,
];

export {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
};