// @desc Custom API Error class
// @file utils/apiError.js
// @access Public

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}

// Default export
export default ApiError;
