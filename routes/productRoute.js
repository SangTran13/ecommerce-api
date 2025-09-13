import express from "express";

import {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} from "../utils/validators/productValidator.js";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService.js";

const router = express.Router();

// Define routes for getting all products and creating a new product
router.route("/").get(getProducts).post(createProductValidator, createProduct);

// Define routes for getting, updating, and deleting a specific product by ID
router
  .route("/:id")
  .get(getProductValidator, getProductById)
  .put(updateProductValidator, updateProduct)
  .delete(deleteProductValidator, deleteProduct);

// Export the router
export default router;
