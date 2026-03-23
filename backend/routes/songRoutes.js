import express from 'express';
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong
} from '../controllers/songController.js';
import {
  validateSong,
  validateUpdateSong
} from '../middleware/songValidation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Publika routes
router.get('/songs', getAllSongs);
router.get('/songs/:id', getSongById);

// Endast Admin routes
router.post('/songs', authenticateToken, requireAdmin, validateSong, createSong);
router.put('/songs/:id', authenticateToken, requireAdmin, validateUpdateSong, updateSong);
router.delete('/songs/:id', authenticateToken, requireAdmin, deleteSong);

export default router;
