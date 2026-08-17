// src/errors/index.js
const AppError = require('./AppError');

class ValidationError extends AppError {
  constructor(message, fields = []) {
    super(message, 400);
    this.name = 'ValidationError';
    this.fields = fields; // which fields failed
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthenticated. Please log in.') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found.`, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class UnprocessableError extends AppError {
  constructor(message) {
    super(message, 422);
    this.name = 'UnprocessableError';
  }
}

class InternalError extends AppError {
  constructor(message = 'Something went wrong. Please try again later.') {
    super(message, 500);
    this.name = 'InternalError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableError,
  InternalError
};