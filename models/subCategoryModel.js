import mongoose from "mongoose";

// Sub-category schema definition
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "Sub-category name must be unique"],
      minlength: [2, "Too short sub-category name"],
      maxlength: [32, "Too long sub-category name"],
      required: [true, "Sub-category name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Sub-category must belong to a category"],
    },
  },
  { timestamps: true }
);

// Ensure case-insensitive uniqueness via slug
subCategorySchema.index({ category: 1, slug: 1 }, { unique: true });

// Create and export the SubCategory model
const subCategoryModel = mongoose.model("SubCategory", subCategorySchema);

// Export the SubCategory model
export default subCategoryModel;
