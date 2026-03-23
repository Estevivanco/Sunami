import { body } from 'express-validator';
import { handleValidationErrors } from './userValidation.js';

// Artist-valideringsregler
export const validateArtist = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Artist name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Artist name must be between 1 and 100 characters')
    .escape(),
  
  body('genre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Genre cannot exceed 50 characters')
    .escape(),
  
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters')
    .escape(),
  
  handleValidationErrors
];

export const validateUpdateArtist = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Artist name cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Artist name must be between 1 and 100 characters')
    .escape(),
  
  body('genre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Genre cannot exceed 50 characters')
    .escape(),
  
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters')
    .escape(),
  
  handleValidationErrors
];
