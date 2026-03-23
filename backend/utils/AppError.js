/**
 * Anpassad felklass för applikationsfel
 * Utökar den inbyggda Error-klassen med statusCode och isOperational-flagga
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Operativa fel vi litar på (vs programmeringsfel)
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
