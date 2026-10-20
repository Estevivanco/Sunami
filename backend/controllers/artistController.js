import artistRepository from '../repositories/artistRepository.js';
import albumRepository from '../repositories/albumRepository.js';
import songRepository from '../repositories/songRepository.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Get all artists
const getAllArtists = catchAsync(async (req, res, next) => {
  const artists = await artistRepository.findAll();
  res.json(artists);
});

// Get a specific artist by ID
const getArtistById = catchAsync(async (req, res, next) => {
  const artist = await artistRepository.findById(req.params.id);
  
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }
  
  res.json(artist);
});

// Create new artist
const createArtist = catchAsync(async (req, res, next) => {
  const newArtist = await artistRepository.create({
    name: req.body.name,
    genre: req.body.genre,
    country: req.body.country
  });
  
  res.status(201).json(newArtist);
});

// Update artist
const updateArtist = catchAsync(async (req, res, next) => {
  const artist = await artistRepository.update(req.params.id, req.body);
  
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }
  
  res.json(artist);
});

// Delete artist
const deleteArtist = catchAsync(async (req, res, next) => {
  const artist = await artistRepository.delete(req.params.id);
  
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }
  
  res.json({ message: 'Artist deleted successfully' });
});

// Get artist's songs with optional search
const getArtistSongs = catchAsync(async (req, res, next) => {
  const artistId = req.params.id;
  const searchQuery = req.query.q || ''; // Get 'q' query parameter

  // Verify artist exists
  const artist = await artistRepository.findById(artistId);
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }

  // Search songs by artist with optional title filter
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

// Get all albums by an artist
const getArtistAlbums = catchAsync(async (req, res, next) => {
  const artistId = req.params.id;

  // Verify artist exists
  const artist = await artistRepository.findById(artistId);
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }

  // Get all albums by this artist
  const albums = await albumRepository.findByArtist(artistId);
  
  res.json(albums);
});

// Get songs from a specific album by a specific artist
const getArtistAlbumSongs = catchAsync(async (req, res, next) => {
  const { id: artistId, albumId } = req.params;

  // Verify artist exists
  const artist = await artistRepository.findById(artistId);
  if (!artist) {
    return next(new AppError('Artist not found', 404));
  }

  // Fetch album and verify it belongs to this artist
  const album = await albumRepository.findById(albumId);
  if (!album) {
    return next(new AppError('Album not found', 404));
  }

  // Verify album belongs to this artist
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
