import Product from "../models/productModel.js";

import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "./handlersFactory.js";

// @description Get all products
// @route GET /api/v1/products?page=...&limit=...
// @access Public
export const getProducts = getAll(Product, "Product", {
  populate: { path: "category subCategories brand", select: "name -_id" },
});

// @desc Get specific product by ID
// @route GET /api/v1/products/:id
// @access Public
export const getProductById = getOne(Product, {
  populate: { path: "category subCategories brand", select: "name -_id" },
});

// @description Create a new product
// @route POST /api/v1/products
// @access Public
export const createProduct = createOne(Product);

// @desc Update specific product by ID
// @route PUT /api/v1/products/:id
// @access Public
export const updateProduct = updateOne(Product);

// @desc Delete specific product by ID
// @route DELETE /api/v1/products/:id
// @access Public
export const deleteProduct = deleteOne(Product);
