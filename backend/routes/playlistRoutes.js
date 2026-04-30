import express from 'express';
import {
  getAllPlaylists,
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  followPlaylist,
  unfollowPlaylist,
  addCollaborator,
  removeCollaborator,
  getPublicPlaylists
} from '../controllers/playlistController.js';
import {
  validatePlaylist,
  validateUpdatePlaylist
} from '../middleware/playlistValidation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// PUBLIC
router.get('/playlists', getAllPlaylists);
router.get('/playlists/public', getPublicPlaylists);
router.get('/playlists/my', authenticateToken, getUserPlaylists);
router.get('/playlists/:id', authenticateToken, getPlaylistById);

// USER
router.post('/playlists', authenticateToken, validatePlaylist, createPlaylist);
router.put('/playlists/:id', authenticateToken, validateUpdatePlaylist, updatePlaylist);
router.delete('/playlists/:id', authenticateToken, deletePlaylist);

// SONG MANAGEMENT
router.post('/playlists/:id/songs', authenticateToken, addSongToPlaylist);
router.delete('/playlists/:id/songs/:songId', authenticateToken, removeSongFromPlaylist);

// FOLLOW
router.post('/playlists/:id/follow', authenticateToken, followPlaylist);
router.delete('/playlists/:id/follow', authenticateToken, unfollowPlaylist);

// COLLABORATOR
router.post('/playlists/:id/collaborators', authenticateToken, addCollaborator);
router.delete('/playlists/:id/collaborators', authenticateToken, removeCollaborator);

export default router;
