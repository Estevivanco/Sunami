import { API_ENDPOINTS } from '../constants/api'

export const fetchAlbums = async () => {
    const response = await fetch(API_ENDPOINTS.ALBUMS)
    if (!response.ok) {
        throw new Error('Failed to fetch albums')
    }
    return await response.json()
}

export const fetchAlbumsById = async (albumId) => {
    const response = await fetch(API_ENDPOINTS.ALBUM_BY_ID(albumId))
    if(!response.ok) {
        throw new Error('Failed to fetch album by id')
    }
    return await response.json()
}

export const fetchAlbumsByIdWithSongs = async (albumId) => {
    const response = await fetch(API_ENDPOINTS.ALBUM_SONGS(albumId))
    if(!response.ok){
        throw new Error('Failed to fetch album songs')
    }
    return await response.json()
}