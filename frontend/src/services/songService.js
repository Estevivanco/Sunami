/**
 * Song Service
 * Handles all song-related API calls
 * 
 * Functions to implement:
 * - fetchSongs() - GET all songs
 * - fetchSongById(songId) - GET single song by ID
 * - searchSongs(query) - GET songs by search query
 * - fetchSongsByGenre(genre) - GET songs filtered by genre
 * - fetchSongsByArtist(artistId) - GET songs by artist
 * - createSong(songData) - POST new song (admin only)
 * - updateSong(songId, songData) - PUT/PATCH song (admin only)
 * - deleteSong(songId) - DELETE song (admin only)
 * 
 * Should return:
 * - Song objects with: id, title, artist, album, duration, url, etc.
 */

import { API_ENDPOINTS } from '../constants/api'

export const fetchSongs = async () => {
    const response = await fetch(API_ENDPOINTS.SONGS)
    if (!response.ok) {
        throw new Error('Failed to fetch songs')
    }
    return await response.json()
}

export const searchSongs = async (query) => {
    if (!query || query.trim() === '') {
        return []
    }
    
    const response = await fetch(API_ENDPOINTS.SEARCH_SONGS(query))
    if (!response.ok) {
        throw new Error('Failed to search songs')
    }
    return await response.json()
}
