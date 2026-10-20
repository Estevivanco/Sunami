/**
 * Custom error class for application errors
 * Extends the built-in Error class with statusCode and an isOperational flag
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Operational errors we trust (vs programming errors)
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
