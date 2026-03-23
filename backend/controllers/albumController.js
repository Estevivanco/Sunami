import albumRepository from '../repositories/albumRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Hämta alla album (populera artist, men inte hela songs-arrayen)
const getAllAlbums = catchAsync(async (req, res, next) => {
  // Populera endast artist, behåll songs som ID:n för minimal respons
  const albums = await albumRepository.findAll('artist');
  res.json(albums);
});

// Hämta ett specifikt album med ID
const getAlbumById = catchAsync(async (req, res, next) => {
  const album = await albumRepository.findById(req.params.id);
  
  if (!album) {
    return next(new AppError('Album not found', 404));
  }
  
  res.json(album);
});

// Skapa nytt album
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

// Uppdatera album
const updateAlbum = catchAsync(async (req, res, next) => {
  const album = await albumRepository.update(req.params.id, req.body);
  
  if (!album) {
    return next(new AppError('Album not found', 404));
  }
  
  res.json(album);
});

// Radera album
const deleteAlbum = catchAsync(async (req, res, next) => {
  const album = await albumRepository.delete(req.params.id);
  
  if (!album) {
    return next(new AppError('Album not found', 404));
  }
  
  res.json({ message: 'Album deleted successfully' });
});

// Hämta alla låtar i ett album
const getAlbumSongs = catchAsync(async (req, res, next) => {
  const album = await albumRepository.findById(req.params.id);
  
  if (!album) {
    return next(new AppError('Album not found', 404));
  }
  
  res.json({
    album: {
      id: album._id,
      title: album.title,
      artist: album.artist
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
