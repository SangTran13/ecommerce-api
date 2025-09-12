import slugify from "slugify";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";

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

export const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findById(req.params.id);
    if (!document) {
      return next(new ApiError(`${Model.modelName} not found`, 404));
    }
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }

    Object.assign(document, req.body);
    await document.save();
    res.status(200).json({
      success: true,
      message: `${Model.modelName} updated successfully`,
    });
  });

export const createOne = (Model) =>
  asyncHandler(async (req, res, _next) => {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const document = await Model.create(req.body);
    res.status(201).json({
      success: true,
      message: `${Model.modelName} created successfully`,
      document,
    });
  });
