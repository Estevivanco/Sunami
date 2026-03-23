/**
 * AlbumPage
 * Individual album detail page
 * 
 * Should display:
 * - Album header (cover, title, artist, year, duration)
 * - Play button
 * - Save to library button
 * - Track list with:
 *   - Track number
 *   - Song title
 *   - Duration
 *   - Explicit badge (if applicable)
 * - Album info (release date, total tracks, label)
 * - More by this artist section
 * 
 * Features:
 * - Play entire album
 * - Play individual tracks
 * - Save/remove album from library
 * - Add songs to playlist
 * - Click artist name to navigate
 * 
 * Uses:
 * - useParams to get album ID from URL
 * - albumService.fetchAlbumById(id)
 * - albumService.fetchAlbumSongs(id)
 * - usePlayer to play songs
 * - Card component for related albums
 */

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { fetchAlbumsByIdWithSongs } from "../services/albumService"
import { likeSong, unlikeSong, saveAlbum, unsaveAlbum } from "../services/userService"
import { getArtistRoute } from "../constants/routes"
import { formatDuration } from "../utils/formatDuration"
import { formatDate } from "../utils/formatDate"
import { formatNumberCompact } from "../utils/formatNumber"
import { usePlayer } from "../hooks/usePlayer"
import { useAuth } from "../hooks/useAuth"
import { useLibrary } from "../hooks/useLibrary"
import AddToPlaylistModal from "../components/AddToPlaylistModal"
import styles from "./AlbumPage.module.css"

const AlbumPage = () => {
    const { id } = useParams() // Get album ID from URL
    const { play } = usePlayer() // Get play function from player context
    const { user } = useAuth() // Get user to check authentication
    const { isSongLiked, addLikedSong, removeLikedSong, isAlbumSaved, addSavedAlbum, removeSavedAlbum } = useLibrary()
    
    const [album, setAlbum] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)

    useEffect(() => {
        loadAlbumData()
    }, [id]) // Reload when album ID changes

    const loadAlbumData = async () => {
        try {
          setLoading(true)
          setError(null)
          
          // Fetch album with songs using the ID from URL
          const albumData = await fetchAlbumsByIdWithSongs(id)
          console.log(albumData)
          setAlbum(albumData)
        } catch (err) {
          setError(err.message)
          console.error('Error fetching album:', err)
        } finally {
          setLoading(false)
        }
      }

    if (loading) {
        return <div className="page">Loading album...</div>
    }

    if (error) {
        return (
            <div className="page">
                <p>Error: {error}</p>
                <button onClick={loadAlbumData}>Try Again</button>
            </div>
        )
    }

    if (!album) {
        return <div className="page">Album not found</div>
    }

    const albumInfo = album.album || {}
    const songs = album.songs || []
    const artist = albumInfo.artist || {}

    // Handle song click - play song and set queue to all album songs
    const handleSongClick = (song, index) => {
        play(song, songs)
    }

    const handleAddToPlaylist = (song) => {
        setSelectedSong(song)
        setIsPlaylistModalOpen(true)
    }

    const handleLikeSong = async (song, event) => {
        event.stopPropagation()
        try {
            const isLiked = isSongLiked(song._id)
            console.log('Toggling like for song:', song._id, 'Current state:', isLiked)
            
            if (isLiked) {
                const response = await unlikeSong(song._id)
                console.log('Unlike response:', response)
                removeLikedSong(song._id)
            } else {
                const response = await likeSong(song._id)
                console.log('Like response:', response)
                addLikedSong(song._id)
            }
        } catch (err) {
            console.error('Error toggling like:', err)
            alert('Failed to like/unlike song: ' + err.message)
        }
    }

    const handleSaveAlbum = async () => {
        try {
            const isSaved = isAlbumSaved(id)
            console.log('Toggling save for album:', id, 'Current state:', isSaved)
            
            if (isSaved) {
                const response = await unsaveAlbum(id)
                console.log('Unsave response:', response)
                removeSavedAlbum(id)
            } else {
                const response = await saveAlbum(id)
                console.log('Save response:', response)
                addSavedAlbum(id)
            }
        } catch (err) {
            console.error('Error toggling save album:', err)
            alert('Failed to save/unsave album: ' + err.message)
        }
    }

    return (
        <div className={`page ${styles.albumPage}`}>
            {/* Album Header */}
            <div className={styles.albumHeader}>
                {albumInfo.coverImage && (
                    <img 
                        src={albumInfo.coverImage} 
                        alt={albumInfo.title} 
                        className={styles.albumCover} 
                    />
                )}
                <div className={styles.albumInfo}>
                    <p className={styles.albumType}>Album</p>
                    <h1 className={styles.albumTitle}>{albumInfo.title}</h1>
                    <div className={styles.albumMeta}>
                        <Link 
                            to={getArtistRoute(artist._id)} 
                            className={styles.artistName}
                        >
                            {artist.name}
                        </Link>
                        {albumInfo.releaseDate && (
                            <span className={styles.albumYear}>
                                {new Date(albumInfo.releaseDate).getFullYear()}
                            </span>
                        )}
                        <span className={styles.albumCount}>
                            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
                        </span>
                    </div>
                    {user && (
                        <button
                            className={`${styles.saveAlbumButton} ${isAlbumSaved(id) ? styles.saved : ''}`}
                            onClick={handleSaveAlbum}
                            title={isAlbumSaved(id) ? 'Remove from library' : 'Save to library'}
                        >
                            {isAlbumSaved(id) ? '✓ Saved' : '+ Save'}
                        </button>
                    )}
                </div>
            </div>

            {/* Tracks Content */}
            <div className={styles.albumContent}>
                {songs.length > 0 ? (
                    <div className={styles.tracksTable}>
                        {/* Table Header */}
                        <div className={styles.tracksHeader}>
                            <span className={styles.headerNumber}>#</span>
                            <span className={styles.headerTitle}>Title</span>
                            <span className={styles.headerDate}>Date Added</span>
                            <span className={styles.headerPlayCount}>Play Count</span>
                            <span className={styles.headerDuration}>Duration</span>
                        </div>
                        
                        {/* Track Rows */}
                        <div className={styles.tracksList}>
                            {songs.map((song, index) => (
                                <div 
                                    key={song._id} 
                                    className={styles.trackItem}
                                >
                                    <span className={styles.trackNumber}>{index + 1}</span>
                                    <div className={styles.trackInfo}>
                                        <div 
                                            className={styles.trackTitle}
                                            onClick={() => handleSongClick(song, index)}
                                        >
                                            {song.title}
                                        </div>
                                        <Link 
                                            to={getArtistRoute(artist._id)} 
                                            className={styles.trackArtist}
                                        >
                                            {artist.name}
                                        </Link>
                                    </div>
                                    <div className={styles.trackDate}>{formatDate(song.createdAt)}</div>
                                    <div className={styles.trackPlayCount}>{formatNumberCompact(song.playCount)}</div>
                                    <div className={styles.trackDuration}>{formatDuration(song.duration)}</div>
                                    {user && (
                                        <div className={styles.trackActions}>
                                            <button
                                                className={`${styles.iconButton} ${isSongLiked(song._id) ? styles.liked : ''}`}
                                                onClick={(e) => handleLikeSong(song, e)}
                                                title={isSongLiked(song._id) ? 'Remove from liked songs' : 'Add to liked songs'}
                                            >
                                                ♥
                                            </button>
                                            <button
                                                className={styles.addButton}
                                                onClick={() => handleAddToPlaylist(song)}
                                                title="Add to playlist"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className={styles.noContent}>No songs available</p>
                )}
            </div>

            {/* Add to Playlist Modal */}
            <AddToPlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={() => setIsPlaylistModalOpen(false)}
                song={selectedSong}
            />
        </div>
    )
}

export default AlbumPage