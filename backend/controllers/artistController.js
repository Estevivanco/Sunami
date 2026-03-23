import artistRepository from '../repositories/artistRepository.js';
import albumRepository from '../repositories/albumRepository.js';
import songRepository from '../repositories/songRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Hämta alla artister
const getAllArtists = catchAsync(async (req, res, next) => {
  const artists = await artistRepository.findAll();
  res.json(artists);
});

// Hämta en specifik artist med ID
const getArtistById = catchAsync(async (req, res, next) => {
  const artist = await artistRepository.findById(req.params.id);
  
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }
  
  res.json(artist);
});

// Skapa ny artist
const createArtist = catchAsync(async (req, res, next) => {
  const newArtist = await artistRepository.create({
    name: req.body.name,
    genre: req.body.genre,
    country: req.body.country
  });
  
  res.status(201).json(newArtist);
});

// Uppdatera artist
const updateArtist = catchAsync(async (req, res, next) => {
  const artist = await artistRepository.update(req.params.id, req.body);
  
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }
  
  res.json(artist);
});

// Radera artist
const deleteArtist = catchAsync(async (req, res, next) => {
  const artist = await artistRepository.delete(req.params.id);
  
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }
  
  res.json({ message: 'Artist deleted successfully' });
});

// Hämta artists låtar med valfri sökning
const getArtistSongs = catchAsync(async (req, res, next) => {
  const artistId = req.params.id;
  const searchQuery = req.query.q || ''; // Hämta 'q' query parameter

  // Verifiera att artist finns
  const artist = await artistRepository.findById(artistId);
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }

  // Sök låtar efter artist med valfritt titelfilter
  const songs = await songRepository.searchByArtist(artistId, searchQuery);
  
  res.json({
    artist: {
      id: artist._id,
      name: artist.name
    },
    query: searchQuery || null,
    count: songs.length,
    songs
  });
});

// Hämta alla album av en artist
const getArtistAlbums = catchAsync(async (req, res, next) => {
  const artistId = req.params.id;

  // Verifiera att artist finns
  const artist = await artistRepository.findById(artistId);
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }

  // Hämta alla album av denna artist
  const albums = await albumRepository.findByArtist(artistId);
  
  res.json(albums);
});

// Hämta låtar från ett specifikt album av en specifik artist
const getArtistAlbumSongs = catchAsync(async (req, res, next) => {
  const { id: artistId, albumId } = req.params;

  // Verifiera att artist finns
  const artist = await artistRepository.findById(artistId);
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }

  // Hämta album och verifiera att det tillhör denna artist
  const album = await albumRepository.findById(albumId);
  if (!album) {
    return next(new AppError('Album not found', 404));
  }

  // Verifiera att album tillhör denna artist
  if (album.artist._id.toString() !== artistId) {
    return next(new AppError('Album does not belong to this artist', 400));
  }

  res.json({
    artist: {
      id: artist._id,
      name: artist.name
    },
    album: {
      id: album._id,
      title: album.title
    },
    count: album.songs.length,
    songs: album.songs
  });
});

export {
  getAllArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
  getArtistSongs,
  getArtistAlbums,
  getArtistAlbumSongs
};
