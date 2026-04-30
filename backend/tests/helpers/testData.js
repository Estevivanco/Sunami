/**
 * Test data factory functions
 * Use these to create consistent test data across your tests
 */

export const createArtistData = (overrides = {}) => ({
  name: "Test Artist",
  genres: ["Rock"],
  country: "USA",
  bio: "Test bio",
  verified: false,
  monthlyListeners: 1000,
  followers: 500,
  ...overrides
});

export const createAlbumData = (artistId, overrides = {}) => ({
  title: "Test Album",
  artist: artistId,
  releaseDate: new Date("2024-01-01"),
  genres: ["Rock"],
  totalTracks: 10,
  ...overrides
});

export const createSongData = (artistId, albumId, overrides = {}) => ({
  title: "Test Song",
  artist: artistId,
  album: albumId,
  duration: 180,
  trackNumber: 1,
  genre: ["Rock"],
  ...overrides
});

export const createUserData = (overrides = {}) => ({
  username: "testuser",
  email: "test@example.com",
  password: "Test123!@#",
  role: "user",
  ...overrides
});

export const createPlaylistData = (userId, overrides = {}) => ({
  name: "Test Playlist",
  description: "Test playlist description",
  owner: userId,
  songs: [],
  isPublic: true,
  ...overrides
});
