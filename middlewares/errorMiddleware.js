import ApiError from "../utils/apiError.js";

// Global error handling middleware
const globalError = (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Handle Mongo duplicate key error
  if (err && err.code === 11000) {
    err.statusCode = 400;
    err.status = "fail";
    err.isOperational = true;
    err.message = formatDuplicateKeyError(err);
  }

  if (process.env.NODE_ENV === "development") {
    // Handle JWT errors
    const jwtError = handleJwtErrors(err);
    if (jwtError) {
      return sendErrorForDev(jwtError, res);
    }

    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // Handle JWT errors
    const jwtError = handleJwtErrors(err);
    if (jwtError) {
      return sendErrorForProd(jwtError, res);
    }

    sendErrorForProd(err, res);
  }
};

// Handler JWT errors
const handleJwtErrors = (err) => {
  if (err.name === "JsonWebTokenError") {
    return new ApiError("Invalid token. Please log in again!", 401);
  } else if (err.name === "TokenExpiredError") {
    return new ApiError("Your token has expired! Please log in again.", 401);
  } else if (err.name === "NotBeforeError") {
    return new ApiError("Token not active. Please log in again.", 401);
  }
  return err;
};

// Helper functions
const formatDuplicateKeyError = (err) => {
  const fields = err.keyValue ? Object.keys(err.keyValue) : [];
  const fieldList = fields.length ? `${fields.join(", ")}` : "unique field";
  return `Duplicate value for ${fieldList}`;
};

// Send error details in development environment
const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    isOperational: err.isOperational,
    stack: err.stack,
  });
};

// Send limited error details in production environment
const sendErrorForProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak details
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

// Export the global error handling middleware
export default globalError;
