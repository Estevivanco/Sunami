import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  makeAdmin,
  getUserLibrary,
  toggleLikeSong,
  toggleSaveAlbum,
  toggleFollowArtist,
  updateProfile,
  deleteOwnAccount
} from '../controllers/userController.js';
import {
  validateUpdateUser
} from '../middleware/userValidation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * User Management Routes
 * All routes require authentication
 * Authentication routes moved to authRoutes.js
 */

// Current user profile (requires authentication)
router.get('/users/profile', authenticateToken, getProfile);

// Update current user profile (requires authentication)
router.put('/users/profile', authenticateToken, validateUpdateUser, updateProfile);

// Delete own account (requires authentication)
router.delete('/users/me/account', authenticateToken, deleteOwnAccount);

// Library routes - Get user's library
router.get('/users/me/library', authenticateToken, getUserLibrary);

// Library routes - Songs
router.post('/users/me/songs/:songId', authenticateToken, toggleLikeSong);
router.delete('/users/me/songs/:songId', authenticateToken, toggleLikeSong);

// Library routes - Albums
router.post('/users/me/albums/:albumId', authenticateToken, toggleSaveAlbum);
router.delete('/users/me/albums/:albumId', authenticateToken, toggleSaveAlbum);

// Library routes - Artists
router.post('/users/me/artists/:artistId', authenticateToken, toggleFollowArtist);
router.delete('/users/me/artists/:artistId', authenticateToken, toggleFollowArtist);

// Admin-only routes - User management
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.get('/users/:id', authenticateToken, getUserById);
router.put('/users/:id', authenticateToken, requireAdmin, validateUpdateUser, updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);
router.post('/users/:id/make-admin', authenticateToken, requireAdmin, makeAdmin);

export default router;
