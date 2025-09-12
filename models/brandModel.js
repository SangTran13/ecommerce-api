import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: [true, "Brand name must be unique"],
      minlength: [3, "Brand name must be at least 3 characters"],
      maxlength: [50, "Brand name must be at most 50 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensure case-insensitive uniqueness via slug
brandSchema.index({ slug: 1 }, { unique: true });

const brandModel = mongoose.model("Brand", brandSchema);

export default brandModel;
