import express from 'express';
import {
  getAllPlaylists,
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
} from '../controllers/playlistController.js';
import {
  validatePlaylist,
  validateUpdatePlaylist
} from '../middleware/playlistValidation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/playlists', getAllPlaylists);
router.get('/playlists/my', authenticateToken, getUserPlaylists);
router.get('/playlists/:id', getPlaylistById);
router.post('/playlists', authenticateToken, validatePlaylist, createPlaylist);
router.put('/playlists/:id', authenticateToken, validateUpdatePlaylist, updatePlaylist);
router.delete('/playlists/:id', authenticateToken, deletePlaylist);

// Song management routes
router.post('/playlists/:id/songs', authenticateToken, addSongToPlaylist);
router.delete('/playlists/:id/songs/:songId', authenticateToken, removeSongFromPlaylist);

export default router;
