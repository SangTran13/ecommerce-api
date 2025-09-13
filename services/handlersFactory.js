import slugify from "slugify";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
import ApiFeatures from "../utils/apiFeatures.js";
import qs from "qs";

// Generic factory functions for CRUD operations
// Delete document by ID
export const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new ApiError(`${Model.modelName} not found`, 404));
    }
    res.status(200).json({
      success: true,
      message: `${Model.modelName} deleted successfully`,
    });
  });

// Update document by ID
export const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findById(req.params.id);
    if (!document) {
      return next(new ApiError(`${Model.modelName} not found`, 404));
    }

    // Handle slug generation for different field names
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    } else if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    // Special handling for Product category-subCategory relationship
    if (Model.modelName === "Product" && req.body.category) {
      if (
        !Array.isArray(req.body.subCategories) ||
        req.body.subCategories.length === 0
      ) {
        req.body.subCategories = [];
      }
    }

    Object.assign(document, req.body);
    await document.save();

    // Dynamic response key
    const responseKey = Model.modelName.toLowerCase();

    res.status(200).json({
      success: true,
      message: `${Model.modelName} updated successfully`,
      [responseKey]: document,
    });
  });

// Create a new document
export const createOne = (Model) =>
  asyncHandler(async (req, res, _next) => {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    } else if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const document = await Model.create(req.body);
    const responseKey = Model.modelName.toLowerCase();

    res.status(201).json({
      success: true,
      message: `${Model.modelName} created successfully`,
      [responseKey]: document,
    });
  });

// Get specific document by ID
export const getOne = (Model, populateOpt) =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id).lean();
    
    if (populateOpt) {
      if (typeof populateOpt === "string") {
        query = query.populate(populateOpt);
      } else if (populateOpt.populate) {
        query = query.populate(populateOpt.populate);
      } else if (populateOpt.path) {
        query = query.populate(populateOpt);
      }
    }

    const document = await query;
    if (!document) {
      return next(new ApiError(`${Model.modelName} not found`, 404));
    }
    res.status(200).json({
      success: true,
      document,
    });
  });

// Get all documents with filtering, pagination, sorting, and field limiting
export const getAll = (Model, modelName, populateOpt) =>
  asyncHandler(async (req, res) => {
    // Parse query string to nested object
    const query = qs.parse(req._parsedUrl.query);

    // For nested routes (like subCategories by category)
    let filterObject = {};
    if (req.filterObject) {
      filterObject = req.filterObject;
    }

    const countApiFeatures = new ApiFeatures(Model.find(filterObject), query)
      .filter()
      .searchByKeyword(modelName);

    const documentsCount = await countApiFeatures.mongoQuery.countDocuments();

    // Build main query
    let mongoQuery = Model.find(filterObject);

    if (populateOpt) {
      if (typeof populateOpt === "string") {
        mongoQuery = mongoQuery.populate(populateOpt);
      } else if (populateOpt.populate) {
        // Handle object with populate property
        mongoQuery = mongoQuery.populate(populateOpt.populate);
      } else if (populateOpt.path) {
        // Handle direct populate object
        mongoQuery = mongoQuery.populate(populateOpt);
      }
    }

    mongoQuery = mongoQuery.lean();

    const apiFeatures = new ApiFeatures(mongoQuery, query)
      .filter()
      .searchByKeyword(modelName)
      .paginate(documentsCount)
      .limitFields()
      .sort();

    // Execute query
    const { mongoQuery: finalQuery, paginationResult } = apiFeatures;
    const documents = await finalQuery;

    // Dynamic response key based on model name
    const responseKey = modelName.toLowerCase() + "s";

    res.status(200).json({
      success: true,
      results: documents.length,
      pagination: paginationResult,
      [responseKey]: documents,
    });
  });
