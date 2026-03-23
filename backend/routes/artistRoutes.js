import express from 'express';
import {
  getAllArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
  getArtistSongs,
  getArtistAlbums,
  getArtistAlbumSongs
} from '../controllers/artistController.js';
import {
  validateArtist,
  validateUpdateArtist
} from '../middleware/artistValidation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Publika routes
router.get('/artists', getAllArtists);
router.get('/artists/:id', getArtistById);
router.get('/artists/:id/albums', getArtistAlbums);
router.get('/artists/:id/songs', getArtistSongs);
router.get('/artists/:id/albums/:albumId/songs', getArtistAlbumSongs);

// Endast Admin routes
router.post('/artists', authenticateToken, requireAdmin, validateArtist, createArtist);
router.put('/artists/:id', authenticateToken, requireAdmin, validateUpdateArtist, updateArtist);
router.delete('/artists/:id', authenticateToken, requireAdmin, deleteArtist);

export default router;
