export const fetchPublicPlaylists = async () => {
    return await get(API_ENDPOINTS.PUBLIC_PLAYLISTS)
}
/**
 * Playlist Service
 * Handles all playlist-related API calls
 */

import { API_ENDPOINTS } from '../constants/api'
import { get, post, put, del } from './api'

export const fetchPlaylists = async () => {
    return await get(API_ENDPOINTS.PLAYLISTS)
}

export const fetchMyPlaylists = async (signal) => {
    return await get(API_ENDPOINTS.MY_PLAYLISTS,signal)
}

export const fetchPlaylistById = async (playlistId, signal) => {
    return await get(API_ENDPOINTS.PLAYLIST_BY_ID(playlistId), signal)
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

export const followPlaylist = async (playlistId) => {
    return await post(API_ENDPOINTS.PLAYLIST_FOLLOW(playlistId))
}

export const unfollowPlaylist = async (playlistId) => {
    return await del(API_ENDPOINTS.PLAYLIST_FOLLOW(playlistId))
}

export const addCollaborator = async (playlistId, userId) => {
    return await post(API_ENDPOINTS.PLAYLIST_COLLABORATORS(playlistId), { userId })
}

export const removeCollaborator = async (playlistId, userId) => {
    return await del(API_ENDPOINTS.PLAYLIST_COLLABORATORS(playlistId), { userId })
}
