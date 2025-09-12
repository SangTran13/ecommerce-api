const formatDuplicateKeyError = (err) => {
  const fields = err.keyValue ? Object.keys(err.keyValue) : [];
  const fieldList = fields.length ? `${fields.join(", ")}` : "unique field";
  return `Duplicate value for ${fieldList}`;
};

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
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorForProd(err, res);
  }
};

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    isOperational: err.isOperational,
    stack: err.stack,
  });
};

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

export default globalError;
