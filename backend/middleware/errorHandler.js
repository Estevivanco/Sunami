import { config } from '../config/env.js';

/**
 * Global Error Handler Middleware
 * Hanterar alla fel i applikationen med detaljerad loggning och svar
 */

// Hantera specifika feltyper
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return { message, statusCode: 400 };
};

const handleDuplicateFieldsError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = "${value}". Please use another value.`;
  return { message, statusCode: 409 };
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return { message, statusCode: 400 };
};

const handleJWTError = () => {
  return { message: 'Invalid token. Please log in again.', statusCode: 401 };
};

const handleJWTExpiredError = () => {
  return { message: 'Your token has expired. Please log in again.', statusCode: 401 };
};

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return { message: 'File too large. Maximum size is 5MB.', statusCode: 400 };
  }
  return { message: `File upload error: ${err.message}`, statusCode: 400 };
};

// Skicka felsvar i development-läge
const sendErrorDev = (err, req, res) => {
  console.error('🔴 ERROR DETAILS:', {
    message: err.message,
    stack: err.stack,
    error: err
  });

  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

// Skicka felsvar i production-läge (mindre detaljer)
const sendErrorProd = (err, req, res) => {
  // Operativt, tillförlitligt fel: skicka meddelande till klient
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  } 
  // Programmeringsfel eller okänt fel: läck inte feldetaljer
  else {
    console.error('🔴 ERROR:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }
};

// Huvudsaklig error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Hantera specifika feltyper
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // MongoDB CastError (ogiltigt ObjectId)
  if (err.name === 'CastError') {
    const handled = handleCastError(err);
    error.message = handled.message;
    error.statusCode = handled.statusCode;
    error.isOperational = true;
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const handled = handleDuplicateFieldsError(err);
    error.message = handled.message;
    error.statusCode = handled.statusCode;
    error.isOperational = true;
  }

  // MongoDB Validation Error
  if (err.name === 'ValidationError') {
    const handled = handleValidationError(err);
    error.message = handled.message;
    error.statusCode = handled.statusCode;
    error.isOperational = true;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const handled = handleJWTError();
    error.message = handled.message;
    error.statusCode = handled.statusCode;
    error.isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    const handled = handleJWTExpiredError();
    error.message = handled.message;
    error.statusCode = handled.statusCode;
    error.isOperational = true;
  }

  // Multer File Upload Errors
  if (err.name === 'MulterError') {
    const handled = handleMulterError(err);
    error.message = handled.message;
    error.statusCode = handled.statusCode;
    error.isOperational = true;
  }

  // Express Validator Errors
  if (err.array && typeof err.array === 'function') {
    const errors = err.array();
    error.message = errors.map(e => e.msg).join('. ');
    error.statusCode = 400;
    error.isOperational = true;
  }

  // Skicka svar baserat på miljö
  if (config.nodeEnv === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

// 404 Not Found Handler
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  error.status = 'fail';
  error.isOperational = true;
  next(error);
};

export default errorHandler;
export { notFoundHandler };