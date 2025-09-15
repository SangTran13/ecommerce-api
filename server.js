import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

// Load environment variables from config.env file
dotenv.config({ path: "config.env" });

// Import custom modules
import ApiError from "./utils/apiError.js";
import globalError from "./middlewares/errorMiddleware.js";
import dbConnection from "./config/database.js";
import { connectRedis } from "./config/redis.js";

// Import route files
import categoryRoute from "./routes/categoryRoute.js";
import subCategoryRoute from "./routes/subCategoryRoute.js";
import brandRoute from "./routes/brandRoute.js";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";

// Connect to the database and Redis
dbConnection();
connectRedis();

// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Use morgan middleware for logging HTTP requests in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount routes
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/sub-categories", subCategoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);

// Handle undefined routes
app.use((req, _res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Global error handling middleware
app.use(globalError);

// Middleware to parse JSON bodies
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("Shutting down...");
    process.exit(1);
  });
});
