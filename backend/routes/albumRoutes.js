import express from 'express';
import {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAlbumSongs
} from '../controllers/albumController.js';
import {
  validateAlbum,
  validateUpdateAlbum
} from '../middleware/albumValidation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Publika routes
router.get('/albums', getAllAlbums);
router.get('/albums/:id', getAlbumById);
router.get('/albums/:id/songs', getAlbumSongs);

// Endast Admin routes
router.post('/albums', authenticateToken, requireAdmin, validateAlbum, createAlbum);
router.put('/albums/:id', authenticateToken, requireAdmin, validateUpdateAlbum, updateAlbum);
router.delete('/albums/:id', authenticateToken, requireAdmin, deleteAlbum);

export default router;
