// src/middlewares/error.middleware.js
// const { AppError } = require('../errors');

const logger = require("../config/logger");

const errorMiddleware = (err, req, res, next) => {
  // Default to 500 if no status was set
  err.statusCode = err.statusCode || 500;

  if (err.isOperational) {
    // Safe — we know what this is
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      ...(err.fields && { fields: err.fields }) // include validation fields if present
    });
  }

  // NOT operational — programmer error or unknown crash
  // Log the full error internally (you'd use a logger here)
  logger.error({
    event: 'unhandled.error',
    environment: process.env.NODE_ENV || 'development',
    userId: req.user?.id || null,
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack        // ← actual stack trace from error object
});

  // Never leak internal details to client
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong. Please try again later.'
  });
};

module.exports = errorMiddleware;