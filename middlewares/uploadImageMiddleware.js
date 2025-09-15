import multer from "multer";
import ApiError  from "../utils/apiError.js";

// Multer Configurations
const multerOptions = () => {
  // Storage
  const multerStorage = multer.memoryStorage();

  // File Filter
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only images are allowed", 400), false);
    }
  };

  // Upload
  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });

  return upload;
};

// Upload Single Image
export const uploadSingleImage = (fieldName) =>
  multerOptions().single(fieldName);

// Upload Mix Of Images
export const uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
