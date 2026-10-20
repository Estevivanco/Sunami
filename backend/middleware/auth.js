import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/tokens.js';

/**
 * Middleware to verify JWT access token and authenticate the user.
 * Expects token in Authorization header: "Bearer <token>"
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        message: 'Access token required'
      });
    }

    const verifiedUser = verifyAccessToken(token);

    if (!verifiedUser || !verifiedUser.userId) {
      return res.status(403).json({
        message: 'Invalid token payload'
      });
    }

    req.userId = verifiedUser.userId;
    req.user = verifiedUser; // Contains userId and role
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        message: 'Invalid token'
      });
    }
    return res.status(500).json({
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Optional auth middleware — authenticates if a token is present but does not require it.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
    }
  } catch (error) {
    // Invalid/expired token — silently continue as unauthenticated
  }

  next();
};

/**
 * Middleware to require admin role.
 * Must be used AFTER authenticateToken.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Forbidden: Admin access required'
    });
  }

  next();
};
