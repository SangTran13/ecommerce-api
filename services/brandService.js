import slugify from "slugify";
import asyncHandler from "express-async-handler";
import Brand from "../models/brandModel.js";
import ApiError from "../utils/apiError.js";

// @description Get all brands
// @route GET /api/v1/brands?page=...&limit=...
// @access Public
export const getBrands = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const brands = await Brand.find({}).skip(skip).limit(limit).lean();
  res.status(200).json({
    success: true,
    results: brands.length,
    page,
    brands,
  });
});

// @desc Get specific brand by ID
// @route GET /api/v1/brands/:id
// @access Public
export const getBrandById = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id).lean();
  if (!brand) {
    return next(new ApiError("Brand not found", 404));
  }
  res.status(200).json({
    success: true,
    brand,
  });
});

// @description Create a new brand
// @route POST /api/v1/brands
// @access Public
export const createBrand = asyncHandler(async (req, res, next) => {
  const { name, image } = req.body;

  const existingBrand = await Brand.findOne({ slug: slugify(name) }).lean();
  if (existingBrand) {
    return next(new ApiError("Brand name already exists", 400));
  }

  const newBrand = new Brand({ name, slug: slugify(name), image });
  await newBrand.save();
  res.status(201).json({
    success: true,
    message: "Brand created successfully",
    brand: newBrand,
  });
});

// @desc Update specific brand by ID
// @route PUT /api/v1/brands/:id
// @access Public
export const updateBrand = asyncHandler(async (req, res, next) => {
  const { name, image } = req.body;

  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new ApiError("Brand not found", 404));
  }

  const existingBrand = await Brand.findOne({ slug: slugify(name) }).lean();
  if (existingBrand && existingBrand._id.toString() !== req.params.id) {
    return next(new ApiError("Brand name already exists", 400));
  }

  brand.name = name;
  brand.image = image;
  brand.slug = slugify(name);
  brand.updatedAt = Date.now();
  await brand.save();
  res.status(200).json({
    success: true,
    message: "Brand updated successfully",
    brand,
  });
});

// @desc Delete specific brand by ID
// @route DELETE /api/v1/brands/:id
// @access Public
export const deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) {
    return next(new ApiError("Brand not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Brand deleted successfully",
  });
});
