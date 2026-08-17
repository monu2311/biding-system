// src/errors/AppError.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    // ↑ KEY CONCEPT: operational = we antsicipated this
    // non-operational = programmer mistake or system crash

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;