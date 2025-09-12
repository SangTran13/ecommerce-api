import slugify from "slugify";
import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import ApiError from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";
import qs from "qs";

import { deleteOne } from "./handlersFactory.js";

// @description Get all products
// @route GET /api/v1/products?page=...&limit=...
// @access Public
export const getProducts = asyncHandler(async (req, res) => {
  // Parse query string to nested object
  const query = qs.parse(req._parsedUrl.query);

  const countApiFeatures = new ApiFeatures(Product.find(), query)
    .filter()
    .searchByKeyword("Product");

  const documentsCount = await countApiFeatures.mongoQuery.countDocuments();

  const apiFeatures = new ApiFeatures(
    Product.find().populate("category subCategories brand", "name").lean(),
    query
  )
    .filter()
    .searchByKeyword("Product")
    .paginate(documentsCount)
    .limitFields()
    .sort();

  // Execute query
  const { mongoQuery, paginationResult } = apiFeatures;
  const products = await mongoQuery;

  res.status(200).json({
    success: true,
    results: products.length,
    pagination: paginationResult,
    products,
  });
});

// @desc Get specific product by ID
// @route GET /api/v1/products/:id
// @access Public
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category subCategories brand", "name")
    .lean();
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// @description Create a new product
// @route POST /api/v1/products
// @access Public
export const createProduct = asyncHandler(async (req, res, _next) => {
  const { title } = req.body;
  const newProduct = new Product({ ...req.body, slug: slugify(title) });
  await newProduct.save();
  res.status(201).json({
    success: true,
    product: newProduct,
  });
});

// @desc Update specific product by ID
// @route PUT /api/v1/products/:id
// @access Public
export const updateProduct = asyncHandler(async (req, res, next) => {
  // product is preloaded by validator if available
  const product = req.product || (await Product.findById(req.params.id));
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // Handle slug update
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  } else {
    req.body.slug = product.slug;
  }

  // If category is updated but subCategories are not provided, clear them
  if (req.body.category) {
    if (
      !Array.isArray(req.body.subCategories) ||
      req.body.subCategories.length === 0
    ) {
      req.body.subCategories = [];
    }
  }

  Object.assign(product, req.body);
  await product.save();
  res.status(200).json({
    success: true,
    product,
  });
});

// @desc Delete specific product by ID
// @route DELETE /api/v1/products/:id
// @access Public
export const deleteProduct = deleteOne(Product);
