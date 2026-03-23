import { body } from 'express-validator';
import { handleValidationErrors } from './userValidation.js';

// Album-valideringsregler
export const validateAlbum = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Album title is required')
    .isLength({ max: 200 })
    .withMessage('Album title cannot exceed 200 characters')
    .escape(),
  
  body('artist')
    .notEmpty()
    .withMessage('Artist is required')
    .isMongoId()
    .withMessage('Invalid artist ID'),
  
  body('songs')
    .optional()
    .isArray()
    .withMessage('Songs must be an array'),
  
  body('songs.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid song ID'),
  
  body('releaseYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Release year must be between 1900 and ${new Date().getFullYear() + 1}`),
  
  handleValidationErrors
];

export const validateUpdateAlbum = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Album title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Album title cannot exceed 200 characters')
    .escape(),
  
  body('songs')
    .optional()
    .isArray()
    .withMessage('Songs must be an array'),
  
  body('songs.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid song ID'),
  
  body('releaseYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Release year must be between 1900 and ${new Date().getFullYear() + 1}`),
  
  handleValidationErrors
];
