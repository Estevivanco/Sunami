import songRepository from '../repositories/songRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Get all songs or search songs
const getAllSongs = catchAsync(async (req, res, next) => {
  const searchQuery = req.query.q || req.query.search;

  let songs;
  if (searchQuery) {
    // Search if query parameter is present
    songs = await songRepository.search(searchQuery);
  } else {
    // Get all songs if no search query
    songs = await songRepository.findAll();
  }

  // Return array directly (REST standard)
  res.json(songs);
});

// Get a specific song by ID
const getSongById = catchAsync(async (req, res, next) => {
  const song = await songRepository.findById(req.params.id);
  
  if (!song) {
    return next(new AppError('Song not found', 404));
  }
  
  res.json(song);
});

// Create new song
const createSong = catchAsync(async (req, res, next) => {
  const {title, artist, album, duration, genre} = req.body;

  const newSong = await songRepository.create({
    title,
    artist,
    album,
    duration,
    genre,
  });
  
  res.status(201).json(newSong);
});

// Update song
const updateSong = catchAsync(async (req, res, next) => {
  const song = await songRepository.update(req.params.id, req.body);
  
  if (!song) {
    return next(new AppError('Song not found', 404));
  }
  
  res.json(song);
});

// Delete song
const deleteSong = catchAsync(async (req, res, next) => {
  const song = await songRepository.delete(req.params.id);
  
  if (!song) {
    return next(new AppError('Song not found', 404));
  }
  
  res.json({ message: 'Song deleted successfully' });
});

export {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong
};
