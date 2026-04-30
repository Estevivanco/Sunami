import { body } from 'express-validator';
import { handleValidationErrors } from './userValidation.js';

// Spellista-valideringsregler
export const validatePlaylist = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Playlist name is required')
    .isLength({ max: 100 })
    .withMessage('Playlist name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('songs')
    .optional()
    .isArray()
    .withMessage('Songs must be an array'),
  
  body('songs.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid song ID'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  handleValidationErrors
];

export const validateUpdatePlaylist = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Playlist name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Playlist name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('songs')
    .optional()
    .isArray()
    .withMessage('Songs must be an array'),
  
  body('songs.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid song ID'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),

  handleValidationErrors
];

export const validateAddSong = [
  body('songId')
    .notEmpty()
    .withMessage('Song ID is required')
    .isMongoId()
    .withMessage('Invalid song ID'),
  
  handleValidationErrors
];

export const validateRemoveSong = [
  body('songId')
    .notEmpty()
    .withMessage('Song ID is required')
    .isMongoId()
    .withMessage('Invalid song ID'),
  
  handleValidationErrors
];
