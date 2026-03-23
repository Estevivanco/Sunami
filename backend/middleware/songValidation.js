import { body } from 'express-validator';
import { handleValidationErrors } from './userValidation.js';

// Låt-valideringsregler
export const validateSong = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Song title is required')
    .isLength({ max: 200 })
    .withMessage('Song title cannot exceed 200 characters')
    .escape(),
  
  body('artist')
    .trim()
    .notEmpty()
    .withMessage('Artist is required')
    .isLength({ max: 100 })
    .withMessage('Artist name cannot exceed 100 characters')
    .escape(),
  
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number'),
  
  body('genre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Genre cannot exceed 50 characters')
    .escape(),
  
  handleValidationErrors
];

export const validateUpdateSong = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Song title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Song title cannot exceed 200 characters')
    .escape(),
  
  body('artist')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Artist cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Artist name cannot exceed 100 characters')
    .escape(),
  
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive number'),
  
  body('genre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Genre cannot exceed 50 characters')
    .escape(),
  
  handleValidationErrors
];
