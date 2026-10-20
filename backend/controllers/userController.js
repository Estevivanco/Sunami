import userRepository from '../repositories/userRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import Song from '../models/Song.js';
import Album from '../models/Album.js';
import Artist from '../models/Artist.js';

/**
 * User Management Controller
 * Handles user CRUD operations (not authentication)
 * Authentication moved to authController.js
 */

const searchUsers = catchAsync(async (req, res, next) => {
  const { username } = req.query;
  if (!username || username.trim().length < 1) {
    return res.json([]);
  }
  const users = await userRepository.searchByUsername(username.trim());
  res.json(users);
});

// Get all users (admin only)
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userRepository.findAll();
  
  // Filter response: no password, no email in list view
  const filteredUsers = users.map(user => ({
    id: user._id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt
  }));
  
  res.json(filteredUsers);
});

// Get user by ID
const getUserById = catchAsync(async (req, res, next) => {
  const user = await userRepository.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.json(user);
});

// Update user
const updateUser = catchAsync(async (req, res, next) => {
  // Do not allow password updates through this endpoint
  const { password, ...updateData } = req.body;

  const user = await userRepository.update(req.params.id, updateData);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.json(user);
});

// Delete user (admin only)
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await userRepository.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from deleting their own account
  if (user._id.toString() === req.userId) {
    return next(new AppError('Cannot delete your own account', 400));
  }

  await userRepository.delete(req.params.id);
  res.json({ message: 'User deleted successfully' });
});

// Get current user's profile (protected endpoint)
const getProfile = catchAsync(async (req, res, next) => {
  // req.userId is set by the authenticateToken middleware
  const user = await userRepository.findById(req.userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
});

// Promote user to admin (admin only)
const makeAdmin = catchAsync(async (req, res, next) => {
  const user = await userRepository.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if user is already an admin
  if (user.role === 'admin') {
    return next(new AppError('User is already an admin', 400));
  }

  // Update role to admin
  user.role = 'admin';
  await user.save();

  res.json({
    message: 'User promoted to admin successfully',
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  });
});

// --- LIBRARY OPERATIONS ---

// Get user's library
const getUserLibrary = catchAsync(async (req, res, next) => {
  const library = await userRepository.getUserLibrary(req.userId);
  
  if (!library) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    likedSongs: library.likedSongs || [],
    savedAlbums: library.savedAlbums || [],
    followedArtists: library.followedArtists || [],
    followedPlaylists: library.followedPlaylists || []
  });
});

// Like/Unlike a song
const toggleLikeSong = catchAsync(async (req, res, next) => {
  const { songId } = req.params;
  
  // Verify song exists
  const song = await Song.findById(songId);
  if (!song) {
    return next(new AppError('Song not found', 404));
  }
  
  const user = await userRepository.findById(req.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isLiked = user.likedSongs.includes(songId);
  
  const updatedUser = isLiked
    ? await userRepository.unlikeSong(req.userId, songId)
    : await userRepository.likeSong(req.userId, songId);

  res.json({
    message: isLiked ? 'Song removed from liked songs' : 'Song added to liked songs',
    isLiked: !isLiked,
    likedSongs: updatedUser.likedSongs
  });
});

// Save/Unsave ett album
const toggleSaveAlbum = catchAsync(async (req, res, next) => {
  const { albumId } = req.params;
  
  // Verify album exists
  const album = await Album.findById(albumId);
  if (!album) {
    return next(new AppError('Album not found', 404));
  }
  
  const user = await userRepository.findById(req.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isSaved = user.savedAlbums.includes(albumId);
  
  const updatedUser = isSaved
    ? await userRepository.unsaveAlbum(req.userId, albumId)
    : await userRepository.saveAlbum(req.userId, albumId);

  res.json({
    message: isSaved ? 'Album removed from library' : 'Album saved to library',
    isSaved: !isSaved,
    savedAlbums: updatedUser.savedAlbums
  });
});

// Follow/Unfollow en artist
const toggleFollowArtist = catchAsync(async (req, res, next) => {
  const { artistId } = req.params;
  
  // Verify artist exists
  const artist = await Artist.findById(artistId);
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }
  
  const user = await userRepository.findById(req.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isFollowing = user.followedArtists.includes(artistId);
  
  const updatedUser = isFollowing
    ? await userRepository.unfollowArtist(req.userId, artistId)
    : await userRepository.followArtist(req.userId, artistId);

  res.json({
    message: isFollowing ? 'Artist unfollowed' : 'Artist followed',
    isFollowing: !isFollowing,
    followedArtists: updatedUser.followedArtists
  });
});

// Update user profile
const updateProfile = catchAsync(async (req, res, next) => {
  // Only allow certain fields to be updated
  const { username, email } = req.body;
  
  const updateData = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;

  const user = await userRepository.update(req.userId, updateData);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// Delete own account
const deleteOwnAccount = catchAsync(async (req, res, next) => {
  const user = await userRepository.findById(req.userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await userRepository.delete(req.userId);
  
  res.json({ 
    message: 'Account deleted successfully' 
  });
});

export {
  searchUsers,
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
};
