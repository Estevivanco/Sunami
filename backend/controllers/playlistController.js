import playlistRepository from '../repositories/playlistRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Hämta alla spellistor
const getAllPlaylists = catchAsync(async (req, res, next) => {
  const playlists = await playlistRepository.findAll();
  res.json(playlists);
});

// Hämta användarens egna spellistor
const getUserPlaylists = catchAsync(async (req, res, next) => {
  const playlists = await playlistRepository.findByOwner(req.userId);
  res.json(playlists);
});

// Hämta en specifik spellista med ID
const getPlaylistById = catchAsync(async (req, res, next) => {
  const playlist = await playlistRepository.findById(req.params.id);
  
  if (!playlist) {
    return next(new AppError('Playlist not found', 404));
  }
  
  res.json(playlist);
});

// Skapa ny spellista
const createPlaylist = catchAsync(async (req, res, next) => {
  const { name, description = null, songs = [], createdBy, isPublic = true } = req.body;
  
  const newPlaylist = await playlistRepository.create({
    name,
    description,
    songs,
    createdBy,
    isPublic,
    owner: req.userId // Sätts från authenticateToken middleware
  });
  
  res.status(201).json(newPlaylist);
});

// Uppdatera spellista
const updatePlaylist = catchAsync(async (req, res, next) => {
  // Först, hämta spellistan för att verifiera ägarskap
  const playlist = await playlistRepository.findById(req.params.id);
  
  if (!playlist) {
    return next(new AppError('Playlist not found', 404));
  }
  
  // Verifiera ägarskap
  if (!playlist.owner || playlist.owner.toString() !== req.userId) {
    return next(new AppError('Forbidden: You can only update your own playlists', 403));
  }
  
  // Förhindra ägarmanipulering - ta bort owner från uppdateringsdata
  const { owner, ...updateData } = req.body;
  
  // Uppdatera spellistan
  const updatedPlaylist = await playlistRepository.update(req.params.id, updateData);
  res.json(updatedPlaylist);
});

// Radera spellista
const deletePlaylist = catchAsync(async (req, res, next) => {
  // Först, hämta spellistan för att verifiera ägarskap INNAN radering
  const playlist = await playlistRepository.findById(req.params.id);
  
  if (!playlist) {
    return next(new AppError('Playlist not found', 404));
  }
  
  // Verifiera ägarskap
  if (!playlist.owner || playlist.owner.toString() !== req.userId) {
    return next(new AppError('Forbidden: You can only delete your own playlists', 403));
  }
  
  // Nu radera spellistan
  await playlistRepository.delete(req.params.id);
  res.json({ message: 'Playlist deleted successfully' });
});

// Lägg till låt i spellista
const addSongToPlaylist = catchAsync(async (req, res, next) => {
  const { id: playlistId } = req.params;
  const { songId } = req.body;

  // Hämta spellistan för att verifiera ägarskap
  const playlist = await playlistRepository.findById(playlistId);
  
  if (!playlist) {
    return next(new AppError('Playlist not found', 404));
  }
  
  // Verifiera ägarskap - användare kan bara lägga till låtar i sina egna spellistor
  if (!playlist.owner || playlist.owner.toString() !== req.userId) {
    return next(new AppError('Forbidden: You can only add songs to your own playlists', 403));
  }

  if (!songId) {
    return next(new AppError('Song ID is required', 400));
  }

  // Lägg till låten i spellistan
  const updatedPlaylist = await playlistRepository.addSongToPlaylist(playlistId, songId);
  res.json(updatedPlaylist);
});

// Ta bort låt från spellista
const removeSongFromPlaylist = catchAsync(async (req, res, next) => {
  const { id: playlistId, songId } = req.params;

  // Hämta spellistan för att verifiera ägarskap
  const playlist = await playlistRepository.findById(playlistId);
  
  if (!playlist) {
    return next(new AppError('Playlist not found', 404));
  }
  
  // Verifiera ägarskap
  if (!playlist.owner || playlist.owner.toString() !== req.userId) {
    return next(new AppError('Forbidden: You can only remove songs from your own playlists', 403));
  }

  // Ta bort låten från spellistan
  const updatedPlaylist = await playlistRepository.removeSongFromPlaylist(playlistId, songId);
  res.json(updatedPlaylist);
});

export {
  getAllPlaylists,
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
};
