// Base API URL - can be configured via environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const API_ENDPOINTS = {
  // Auth endpoints (public + protected auth operations)
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  REFRESH: `${BASE_URL}/auth/refresh`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  UPDATE_PASSWORD: `${BASE_URL}/auth/password`,
  
  // User endpoints (protected user management)
  USERS: `${BASE_URL}/users`,
  USER_PROFILE: `${BASE_URL}/users/profile`,
  MAKE_ADMIN: (userId) => `${BASE_URL}/users/${userId}/make-admin`,
  USER_BY_ID: (userId) => `${BASE_URL}/users/${userId}`,
  
  // Music resource endpoints
  ALBUMS: `${BASE_URL}/albums`,
  ALBUM_BY_ID: (albumId) => `${BASE_URL}/albums/${albumId}`,
  ALBUM_SONGS: (albumId) => `${BASE_URL}/albums/${albumId}/songs`,
  
  ARTISTS: `${BASE_URL}/artists`,
  ARTIST_BY_ID: (artistId) => `${BASE_URL}/artists/${artistId}`,
  ARTIST_ALBUMS: (artistId) => `${BASE_URL}/artists/${artistId}/albums`,
  ARTIST_SONGS: (artistId) => `${BASE_URL}/artists/${artistId}/songs`,
  
  SONGS: `${BASE_URL}/songs`,
  SONG_BY_ID: (songId) => `${BASE_URL}/songs/${songId}`,
  SEARCH_SONGS: (query) => `${BASE_URL}/songs?q=${encodeURIComponent(query)}`,
  
  PLAYLISTS: `${BASE_URL}/playlists`,
  PUBLIC_PLAYLISTS: `${BASE_URL}/playlists/public`,
  MY_PLAYLISTS: `${BASE_URL}/playlists/my`,
  PLAYLIST_BY_ID: (playlistId) => `${BASE_URL}/playlists/${playlistId}`,
  PLAYLIST_SONGS: (playlistId) => `${BASE_URL}/playlists/${playlistId}/songs`,
  ADD_SONG_TO_PLAYLIST: (playlistId, songId) => `${BASE_URL}/playlists/${playlistId}/songs/${songId}`,
  PLAYLIST_FOLLOW: (playlistId) => `${BASE_URL}/playlists/${playlistId}/follow`,
  PLAYLIST_COLLABORATORS: (playlistId) => `${BASE_URL}/playlists/${playlistId}/collaborators`,
}

// Export BASE_URL for custom endpoint construction
export { BASE_URL }