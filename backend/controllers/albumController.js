import albumRepository from '../repositories/albumRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Get all albums (populate artist, but not the full songs array)
const getAllAlbums = catchAsync(async (req, res, next) => {
  // Populate artist only, keep songs as IDs for minimal response
  const albums = await albumRepository.findAll('artist');
  res.json(albums);
});

// Get a specific album by ID
const getAlbumById = catchAsync(async (req, res, next) => {
  const album = await albumRepository.findById(req.params.id);
  
  if (!album) {
    return next(new AppError('Album not found', 404));
  }
  
  res.json(album);
});

// Create new album
const createAlbum = catchAsync(async (req, res, next) => {
  const newAlbum = await albumRepository.create({
    title: req.body.title,
    artist: req.body.artist,
    releaseDate: req.body.releaseDate,
    genre: req.body.genre,
    songs: req.body.songs,
    totalTracks: req.body.totalTracks
  });
  
  res.status(201).json(newAlbum);
});

// Update album
const updateAlbum = catchAsync(async (req, res, next) => {
  const album = await albumRepository.update(req.params.id, req.body);
  
  if (!album) {
    return next(new AppError('Album not found', 404));
  }
  
  res.json(album);
});

// Delete album
const deleteAlbum = catchAsync(async (req, res, next) => {
  const album = await albumRepository.delete(req.params.id);
  
  if (!album) {
    return next(new AppError('Album not found', 404));
  }
  
  res.json({ message: 'Album deleted successfully' });
});

// Get all songs in an album
const getAlbumSongs = catchAsync(async (req, res, next) => {
  const album = await albumRepository.findById(req.params.id);
  
  if (!album) {
    return next(new AppError('Album not found', 404));
  }
  
  res.json({
    album: {
      _id: album._id,
      id: album._id,
      title: album.title,
      artist: album.artist,
      coverImage: album.coverImage,
      releaseDate: album.releaseDate,
      genres: album.genres
    },
    count: album.songs.length,
    songs: album.songs
  });
});

export {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAlbumSongs
};
