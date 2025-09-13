import { validationResult } from "express-validator";

// Middleware to handle validation results
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Export the validator middleware
export default validatorMiddleware;
