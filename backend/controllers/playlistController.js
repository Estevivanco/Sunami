// Hämta endast publika spellistor (för sök/browse)
const getPublicPlaylists = catchAsync(async (req, res, next) => {
  const playlists = await playlistRepository.findPublic();
  res.json(playlists);
});
import playlistRepository from '../repositories/playlistRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import userRepository from '../repositories/userRepository.js';


// Hämta alla spellistor (endast publika för icke-ägare)
const getAllPlaylists = catchAsync(async (req, res, next) => {
  let playlists;
  if (req.userId) {
    // Om inloggad, visa publika + egna privata
    playlists = await playlistRepository.findAll();
    playlists = playlists.filter(p => p.isPublic || (p.owner && p.owner.toString() === req.userId));
  } else {
    // Ej inloggad, visa endast publika
    playlists = await playlistRepository.findAll();
    playlists = playlists.filter(p => p.isPublic);
  }
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
  // Debug logging for private playlist access
  if (!playlist.isPublic) {
    console.log('DEBUG: Checking private playlist access');
    console.log('req.userId:', req.userId);
    console.log('playlist.owner:', playlist.owner ? playlist.owner.toString() : null);
  }
  // Om spellistan är privat, endast ägaren får se
  if (!playlist.isPublic && (!req.userId || playlist.owner.toString() !== req.userId)) {
    return next(new AppError('This playlist is private', 403));
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
    isPublic,
    owner: req.userId,
    isSystemPlaylist: req.userRole ==='admin'
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
  if (!songId) {
    return next(new AppError('Song ID is required', 400));
  }

  if (playlist.isSystemPlaylist) {
    return next(new AppError('Forbidden: Sunami playlists cannot be modified', 403));
  }

  //Verifiera ägandeskap
  const isOwner = playlist.owner.toString() === req.userId
  const isCollaborator = playlist.collaborators.some((id) => id.toString() === req.userId)

  if (!isOwner && !isCollaborator) {
    return next(new AppError('Forbidden: You do not have permission to modify this playlist', 403));
  }

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

  if (!songId) {
    return next(new AppError('Song ID is required', 400));
  }

  if (playlist.isSystemPlaylist) {
    return next(new AppError('Forbidden: Sunami playlists cannot be modified', 403));
  }

  // Verifiera ägarskap
  const isOwner = playlist.owner.toString() === req.userId
  const isCollaborator = playlist.collaborators.some((id) => id.toString() === req.userId)
  
  if (!isOwner && !isCollaborator) {
    return next(new AppError('Forbidden: You do not have permission to modify this playlist', 403));
  }

  // Ta bort låten från spellistan
  const updatedPlaylist = await playlistRepository.removeSongFromPlaylist(playlistId, songId);
  res.json(updatedPlaylist);
});

const followPlaylist = catchAsync(async (req,res,next) => {
  const playlist = await playlistRepository.findById(req.params.id)

  if(!playlist) {
    return next(new AppError('Playlist not found', 404))
  }

  // Defensive: check if owner exists
  if(playlist.owner && playlist.owner.toString() === req.userId){
    return next(new AppError('You cannot follow your own playlist', 400))
  }

  if(!playlist.isPublic){
    return next(new AppError('This playlist is private', 403))
  }

  await playlistRepository.addFollower(req.params.id, req.userId)
  await userRepository.addFollowedPlaylist(req.userId, req.params.id)

  res.json({message: 'Playlist followed successfully'})
})

const unfollowPlaylist = catchAsync(async (req, res, next) => {
  const playlist = await playlistRepository.findById(req.params.id);

  if (!playlist) {
    return next(new AppError('Playlist not found', 404));
  }

  // Update both documents
  await playlistRepository.removeFollower(req.params.id, req.userId);
  await userRepository.removeFollowedPlaylist(req.userId, req.params.id);

  res.json({ message: 'Playlist unfollowed successfully' });
});

const addCollaborator = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  const playlist = await playlistRepository.findById(req.params.id);

  if (!playlist) {
    return next(new AppError('Playlist not found', 404));
  }

  // Block collaboration on Sunami playlists
  if (playlist.isSystemPlaylist) {
    return next(new AppError('Forbidden: Sunami playlists cannot have collaborators', 403));
  }

  // Only the super owner can manage collaborators
  if (playlist.owner.toString() !== req.userId) {
    return next(new AppError('Forbidden: Only the playlist owner can manage collaborators', 403));
  }

  // Can't add yourself as collaborator
  if (userId === req.userId) {
    return next(new AppError('You are already the owner of this playlist', 400));
  }

  const updatedPlaylist = await playlistRepository.addCollaborator(req.params.id, userId);
  res.json(updatedPlaylist);
});

const removeCollaborator = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  const playlist = await playlistRepository.findById(req.params.id);

  if (!playlist) {
    return next(new AppError('Playlist not found', 404));
  }

  // Only the super owner can manage collaborators
  if (playlist.owner.toString() !== req.userId) {
    return next(new AppError('Forbidden: Only the playlist owner can manage collaborators', 403));
  }

  const updatedPlaylist = await playlistRepository.removeCollaborator(req.params.id, userId);
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
  removeSongFromPlaylist,
  followPlaylist,
  unfollowPlaylist,
  addCollaborator,
  removeCollaborator,
  getPublicPlaylists
};
