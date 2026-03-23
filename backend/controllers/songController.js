import songRepository from '../repositories/songRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Hämta alla låtar eller sök låtar
const getAllSongs = catchAsync(async (req, res, next) => {
  const searchQuery = req.query.q || req.query.search;
  
  let songs;
  if (searchQuery) {
    // Sök om query parameter finns
    songs = await songRepository.search(searchQuery);
  } else {
    // Hämta alla låtar om ingen sökning
    songs = await songRepository.findAll();
  }
  
  // Returnera array direkt (REST standard)
  res.json(songs);
});

// Hämta en specifik låt med ID
const getSongById = catchAsync(async (req, res, next) => {
  const song = await songRepository.findById(req.params.id);
  
  if (!song) {
    return next(new AppError('Song not found', 404));
  }
  
  res.json(song);
});

// Skapa ny låt
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

// Uppdatera låt
const updateSong = catchAsync(async (req, res, next) => {
  const song = await songRepository.update(req.params.id, req.body);
  
  if (!song) {
    return next(new AppError('Song not found', 404));
  }
  
  res.json(song);
});

// Radera låt
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
