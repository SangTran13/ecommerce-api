import mongoose from "mongoose";

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

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

export default SubCategory;
