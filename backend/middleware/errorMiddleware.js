const logger = require('../utils/logger');

// Standard API Error class to reject requests with custom HTTP status codes
class APIError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Indicates user-facing/operational errors vs system bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error using Winston logger
  logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - Stack: ${err.stack}`);

  // Mongoose Bad ObjectId (Cast Error)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new APIError(message, 404);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered: '${err.keyValue[field]}'. Please use another value for '${field}'.`;
    error = new APIError(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new APIError(message, 400);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new APIError('Not authorized, invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new APIError('Not authorized, token expired', 401);
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Internal Server Error'
  };

  // Include validation details if they exist (e.g. from express-validator)
  if (error.errors) {
    response.errors = error.errors;
  }

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  APIError,
  errorHandler
};
