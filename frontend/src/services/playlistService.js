/**
 * Playlist Service
 * Handles all playlist-related API calls
 */

import { API_ENDPOINTS } from '../constants/api'
import { get, post, put, del } from './api'

export const fetchPlaylists = async () => {
    return await get(API_ENDPOINTS.PLAYLISTS)
}

export const fetchMyPlaylists = async () => {
    return await get(API_ENDPOINTS.MY_PLAYLISTS)
}

export const fetchPlaylistById = async (playlistId) => {
    return await get(API_ENDPOINTS.PLAYLIST_BY_ID(playlistId))
}

export const createPlaylist = async (playlistData) => {
    return await post(API_ENDPOINTS.PLAYLISTS, playlistData)
}

export const updatePlaylist = async (playlistId, playlistData) => {
    return await put(API_ENDPOINTS.PLAYLIST_BY_ID(playlistId), playlistData)
}

export const deletePlaylist = async (playlistId) => {
    return await del(API_ENDPOINTS.PLAYLIST_BY_ID(playlistId))
}

export const addSongToPlaylist = async (playlistId, songId) => {
    return await post(API_ENDPOINTS.PLAYLIST_SONGS(playlistId), { songId })
}

export const removeSongFromPlaylist = async (playlistId, songId) => {
    return await del(API_ENDPOINTS.ADD_SONG_TO_PLAYLIST(playlistId, songId))
}
