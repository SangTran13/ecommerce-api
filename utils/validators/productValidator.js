import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";

import Category from "../../models/categoryModel.js";
import SubCategory from "../../models/subCategoryModel.js";
import Product from "../../models/productModel.js";
import Brand from "../../models/brandModel.js";

import slugify from "slugify";
import ApiError from "../apiError.js";

// Get product validator
const getProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleware,
];

const createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Product title must be between 3 and 100 characters")
    .custom((value) =>
      Product.findOne({ slug: slugify(value) }).then((product) => {
        if (product) {
          return Promise.reject(new Error("Product title already exists"));
        }
      })
    ),
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 20 })
    .withMessage("Product description must be at least 20 characters"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product sold must be a number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isFloat({ max: 2000000000 })
    .withMessage("Too long product price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product price after discount must be a number")
    .custom((value, { req }) => {
      if (value >= req.body.price) {
        throw new Error(
          "Price after discount must be less than the original price"
        );
      }
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("Product category is required")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error("No category for this ID: " + categoryId)
          );
        }
      })
    ),
  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid brand ID format")
    .custom((brandId) =>
      Brand.findById(brandId).then((brand) => {
        if (!brand) {
          return Promise.reject(new Error("Brand not found"));
        }
      })
    ),
  check("subCategories")
    .optional()
    .isArray()
    .withMessage("Subcategories must be an array of IDs")
    .custom((subCategories) => {
      const idsAsStrings = subCategories.map((id) => String(id));
      const hasDuplicates = new Set(idsAsStrings).size !== idsAsStrings.length;
      if (hasDuplicates) {
        throw new Error("Duplicate subcategories are not allowed");
      }
      return true;
    })
    .custom(async (subCategories, { req }) => {
      if (
        req.body.category &&
        Array.isArray(subCategories) &&
        subCategories.length > 0
      ) {
        const count = await SubCategory.countDocuments({
          _id: { $in: subCategories },
          category: req.body.category,
        });
        if (count !== subCategories.length) {
          return Promise.reject(
            new Error(
              "One or more subcategories do not belong to the specified category"
            )
          );
        }
      }
      return true;
    }),
  check("subCategories.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID format")
    .custom((subCategoryId) =>
      SubCategory.findById(subCategoryId).then((subCategory) => {
        if (!subCategory) {
          return Promise.reject(
            new Error("No subcategory for this ID: " + subCategoryId)
          );
        }
      })
    ),
  check("colors")
    .optional()
    .isArray()
    .withMessage("Colors must be an array of strings"),
  check("colors.*")
    .optional()
    .isString()
    .withMessage("Each color must be a string"),
  check("imageCover")
    .notEmpty()
    .withMessage("Product image cover is required")
    .isString()
    .withMessage("Product image cover must be a string"),
  check("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings"),
  check("images.*")
    .optional()
    .isString()
    .withMessage("Each image must be a string"),
  // Optional ratings (align with model ranges)
  check("ratingsAverage")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1.0 and 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("Ratings quantity must be a number"),
  validatorMiddleware,
];

const updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID format"),
  // Preload product once to avoid duplicate DB reads in service
  async (req, _res, next) => {
    const product = await Product.findById(req.params.id).select(
      "category slug"
    );
    if (!product) {
      return next(new ApiError("Product not found", 404));
    }
    req.product = product;
    next();
  },
  check("title")
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage("Product title must be between 3 and 100 characters")
    .custom((value, { req }) =>
      Product.findOne({ slug: slugify(value) }).then((product) => {
        if (product && product._id.toString() !== req.params.id) {
          return Promise.reject(new Error("Product title already exists"));
        }
      })
    ),
  check("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Product description must be at least 20 characters"),
  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product sold must be a number"),
  check("price")
    .optional()
    .isNumeric()
    .withMessage("Product price must be a number")
    .isFloat({ max: 2000000000 })
    .withMessage("Too long product price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product price after discount must be a number")
    .custom((value, { req }) => {
      // On update, ensure price is provided when priceAfterDiscount exists
      if (typeof req.body.price === "undefined") {
        throw new Error("Provide price when priceAfterDiscount is sent");
      }
      if (value >= req.body.price) {
        throw new Error(
          "Price after discount must be less than the original price"
        );
      }
      return true;
    }),
  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error("No category for this ID: " + categoryId)
          );
        }
      })
    ),
  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid brand ID format")
    .custom((brandId) =>
      Brand.findById(brandId).then((brand) => {
        if (!brand) {
          return Promise.reject(new Error("Brand not found"));
        }
      })
    ),
  check("subCategories")
    .optional()
    .isArray()
    .withMessage("Subcategories must be an array of IDs")
    .custom((subCategories) => {
      const idsAsStrings = subCategories.map((id) => String(id));
      const hasDuplicates = new Set(idsAsStrings).size !== idsAsStrings.length;
      if (hasDuplicates) {
        throw new Error("Duplicate subcategories are not allowed");
      }
      return true;
    })
    .custom(async (subCategories, { req }) => {
      if (!Array.isArray(subCategories) || subCategories.length === 0) {
        return true;
      }
      const categoryIdToCheck = req.body.category;
      if (categoryIdToCheck) {
        const count = await SubCategory.countDocuments({
          _id: { $in: subCategories },
          category: categoryIdToCheck,
        });
        if (count !== subCategories.length) {
          return Promise.reject(
            new Error(
              "One or more subcategories do not belong to the specified category"
            )
          );
        }
        return true;
      }
      const product = req.product;
      const count = await SubCategory.countDocuments({
        _id: { $in: subCategories },
        category: product.category,
      });
      if (count !== subCategories.length) {
        return Promise.reject(
          new Error(
            "One or more subcategories do not belong to the current category"
          )
        );
      }
      return true;
    }),
  check("subCategories.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID format")
    .custom((subCategoryId) =>
      SubCategory.findById(subCategoryId).then((subCategory) => {
        if (!subCategory) {
          return Promise.reject(
            new Error("No subcategory for this ID: " + subCategoryId)
          );
        }
      })
    ),
  check("colors")
    .optional()
    .isArray()
    .withMessage("Colors must be an array of strings"),
  check("colors.*")
    .optional()
    .isString()
    .withMessage("Each color must be a string"),
  check("imageCover")
    .optional()
    .isString()
    .withMessage("Product image cover must be a string"),
  check("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings"),
  check("images.*")
    .optional()
    .isString()
    .withMessage("Each image must be a string"),
  // Optional ratings (align with model ranges)
  check("ratingsAverage")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1.0 and 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("Ratings quantity must be a number"),
  validatorMiddleware,
];

const deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleware,
];

export {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
};
