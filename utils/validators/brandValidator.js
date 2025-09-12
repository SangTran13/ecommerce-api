import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";

const getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand ID format"),
  validatorMiddleware,
];

const createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Brand name must be between 3 and 50 characters"),
  validatorMiddleware,
];

const updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand ID format"),
  check("name")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Brand name must be between 3 and 50 characters"),
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
