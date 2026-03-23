/**
 * Library Context
 * Manages user's library state (liked songs, saved albums, followed artists)
 */

import { createContext, useState, useEffect, useContext } from 'react'
import { getUserLibrary } from '../services/userService'
import { useAuth } from '../hooks/useAuth'

const LibraryContext = createContext()

export const LibraryProvider = ({ children }) => {
    const { user } = useAuth()
    const [library, setLibrary] = useState({
        likedSongs: [],
        savedAlbums: [],
        followedArtists: []
    })
    const [loading, setLoading] = useState(true)

    // Fetch library when user is authenticated
    useEffect(() => {
        const fetchLibrary = async () => {
            if (!user) {
                setLibrary({
                    likedSongs: [],
                    savedAlbums: [],
                    followedArtists: []
                })
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const data = await getUserLibrary()
                setLibrary(data)
            } catch (error) {
                console.error('Failed to fetch library:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchLibrary()
    }, [user])

    // Helper function to check if a song is liked
    const isSongLiked = (songId) => {
        return library.likedSongs.some(song => 
            song._id === songId || song === songId
        )
    }

    // Helper function to check if an album is saved
    const isAlbumSaved = (albumId) => {
        return library.savedAlbums.some(album => 
            album._id === albumId || album === albumId
        )
    }

    // Helper function to check if an artist is followed
    const isArtistFollowed = (artistId) => {
        return library.followedArtists.some(artist => 
            artist._id === artistId || artist === artistId
        )
    }

    // Add a song to liked songs
    const addLikedSong = (songId) => {
        setLibrary(prev => ({
            ...prev,
            likedSongs: [...prev.likedSongs, songId]
        }))
    }

    // Remove a song from liked songs
    const removeLikedSong = (songId) => {
        setLibrary(prev => ({
            ...prev,
            likedSongs: prev.likedSongs.filter(id => 
                (id._id || id) !== songId
            )
        }))
    }

    // Add an album to saved albums
    const addSavedAlbum = (albumId) => {
        setLibrary(prev => ({
            ...prev,
            savedAlbums: [...prev.savedAlbums, albumId]
        }))
    }

    // Remove an album from saved albums
    const removeSavedAlbum = (albumId) => {
        setLibrary(prev => ({
            ...prev,
            savedAlbums: prev.savedAlbums.filter(id => 
                (id._id || id) !== albumId
            )
        }))
    }

    // Add an artist to followed artists
    const addFollowedArtist = (artistId) => {
        setLibrary(prev => ({
            ...prev,
            followedArtists: [...prev.followedArtists, artistId]
        }))
    }

    // Remove an artist from followed artists
    const removeFollowedArtist = (artistId) => {
        setLibrary(prev => ({
            ...prev,
            followedArtists: prev.followedArtists.filter(id => 
                (id._id || id) !== artistId
            )
        }))
    }

    const value = {
        library,
        loading,
        isSongLiked,
        isAlbumSaved,
        isArtistFollowed,
        addLikedSong,
        removeLikedSong,
        addSavedAlbum,
        removeSavedAlbum,
        addFollowedArtist,
        removeFollowedArtist
    }

    return (
        <LibraryContext.Provider value={value}>
            {children}
        </LibraryContext.Provider>
    )
}

export const useLibrary = () => {
    const context = useContext(LibraryContext)
    if (!context) {
        throw new Error('useLibrary must be used within a LibraryProvider')
    }
    return context
}
