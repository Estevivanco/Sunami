import { API_ENDPOINTS } from '../constants/api'

export const fetchArtists = async (signal) => {
    const response = await fetch(API_ENDPOINTS.ARTISTS, signal)
    if (!response.ok) {
        throw new Error('Failed to fetch artists')
    }
    return await response.json()
}

export const fetchArtistsById = async (artistId, signal) => {
    const response = await fetch(API_ENDPOINTS.ARTIST_BY_ID(artistId), signal)
    if(!response.ok) {
        throw new Error('Failed to fetch artist by id')
    }
    return await response.json()
}

export const fetchArtistsByIdWithAlbums = async (artistId) => {
    const response = await fetch(API_ENDPOINTS.ARTIST_ALBUMS(artistId))
    if(!response.ok) {
        throw new Error('Failed to fetch artist albums')
    }
    return await response.json()
}

export const fetchArtistsByIdWithSongs = async (artistId) => {
    const response = await fetch(API_ENDPOINTS.ARTIST_SONGS(artistId))
    if(!response.ok){
        throw new Error('Failed to fetch artist songs')
    }
    return await response.json()
}

