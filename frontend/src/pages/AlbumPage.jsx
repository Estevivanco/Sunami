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
import { useToast } from "../hooks/useToast"
import AddToPlaylistModal from "../components/AddToPlaylistModal"
import Toast from "../components/Toast"
import Skeleton from "../components/Skeleton"
import { HeartIcon, PlusIcon } from '../components/Icons'
import styles from "./AlbumPage.module.css"

const AlbumPage = () => {
    const { id } = useParams() // Get album ID from URL
    const { play, currentSong } = usePlayer()
    const { user } = useAuth() // Get user to check authentication
    const { isSongLiked, addLikedSong, removeLikedSong, isAlbumSaved, addSavedAlbum, removeSavedAlbum } = useLibrary()
    const { toast, showToast, clearToast } = useToast()

    const [album, setAlbum] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)

    const loadAlbumData = async (signal) => {
        try {
            setLoading(true)
            setError(null)
            const albumData = await fetchAlbumsByIdWithSongs(id, signal)
            setAlbum(albumData)
        } catch (err) {
            if (err.name === 'AbortError') return
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        loadAlbumData(controller.signal)
        return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])


    if (loading) {
        return (
            <div className={`page ${styles.albumPage}`}>
                <div className={styles.albumHeader}>
                    <Skeleton width="232px" height="232px" />
                    <div className={styles.albumInfo} style={{ gap: 12 }}>
                        <Skeleton width="60px"  height="12px" />
                        <Skeleton width="280px" height="40px" />
                        <Skeleton width="180px" height="16px" />
                        <Skeleton width="100px" height="36px" borderRadius="24px" style={{ marginTop: 8 }} />
                    </div>
                </div>
                <div className={styles.albumContent}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '10px 16px' }}>
                            <Skeleton width="20px"  height="16px" />
                            <Skeleton width="60%"   height="16px" />
                            <Skeleton width="10%"   height="16px" style={{ marginLeft: 'auto' }} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page">
                <p>Error: {error}</p>
                <button onClick={() => loadAlbumData()}>Try Again</button>
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
    const handleSongClick = (song) => {
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
            if (isLiked) {
                await unlikeSong(song._id)
                removeLikedSong(song._id)
            } else {
                await likeSong(song._id)
                addLikedSong(song)
            }
        } catch (err) {
            showToast('Failed to like/unlike song: ' + err.message)
        }
    }

    const handleSaveAlbum = async () => {
        try {
            const isSaved = isAlbumSaved(id)
            if (isSaved) {
                await unsaveAlbum(id)
                removeSavedAlbum(id)
            } else {
                await saveAlbum(id)
                addSavedAlbum(albumInfo)
            }
        } catch (err) {
            showToast('Failed to save/unsave album: ' + err.message)
        }
    }

    return (
        <div className={`page ${styles.albumPage}`}>
            <Toast toast={toast} onDismiss={clearToast} />
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
                                    className={`${styles.trackItem} ${currentSong?._id === song._id ? styles.isPlaying : ''}`}
                                >
                                    {currentSong?._id === song._id ? (
                                        <div className="equalizerBars">
                                            <span className="equalizerBar" />
                                            <span className="equalizerBar" />
                                            <span className="equalizerBar" />
                                        </div>
                                    ) : (
                                        <span className={styles.trackNumber}>{index + 1}</span>
                                    )}
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
                                                <HeartIcon filled={isSongLiked(song._id)} />
                                            </button>
                                            <button
                                                className={styles.addButton}
                                                onClick={() => handleAddToPlaylist(song)}
                                                title="Add to playlist"
                                            >
                                                <PlusIcon />
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