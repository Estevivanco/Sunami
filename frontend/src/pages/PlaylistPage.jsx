/**
 * PlaylistPage
 * Individual playlist detail page
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchPlaylistById, deletePlaylist } from '../services/playlistService'
import { formatDuration } from '../utils/formatDuration'
import { formatDate } from '../utils/formatDate'
import { formatNumberCompact } from '../utils/formatNumber'
import { usePlayer } from '../hooks/usePlayer'
import styles from './PlaylistPage.module.css'

const PlaylistPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { play } = usePlayer()
    
    const [playlist, setPlaylist] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadPlaylistData()
    }, [id])

    const loadPlaylistData = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const playlistData = await fetchPlaylistById(id)
            setPlaylist(playlistData)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching playlist:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSongClick = (song, index) => {
        play(song, playlist.songs)
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this playlist?')) {
            return
        }

        try {
            await deletePlaylist(id)
            navigate('/library')
        } catch (err) {
            alert('Failed to delete playlist: ' + err.message)
            console.error('Error deleting playlist:', err)
        }
    }

    if (loading) {
        return <div className={styles.playlistPage}>Loading playlist...</div>
    }

    if (error) {
        return (
            <div className={styles.playlistPage}>
                <p>Error: {error}</p>
                <button onClick={loadPlaylistData}>Try Again</button>
            </div>
        )
    }

    if (!playlist) {
        return <div className={styles.playlistPage}>Playlist not found</div>
    }

    const songs = playlist.songs || []
    const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0)

    return (
        <div className={styles.playlistPage}>
            {/* Playlist Header */}
            <div className={styles.playlistHeader}>
                <div className={styles.playlistCover}>
                    <span className={styles.playlistIcon}>🎵</span>
                </div>
                <div className={styles.playlistInfo}>
                    <p className={styles.playlistType}>Playlist</p>
                    <h1 className={styles.playlistTitle}>{playlist.name}</h1>
                    {playlist.description && (
                        <p className={styles.playlistDescription}>{playlist.description}</p>
                    )}
                    <div className={styles.playlistMeta}>
                        <span className={styles.playlistOwner}>{playlist.createdBy || 'Unknown'}</span>
                        <span>•</span>
                        <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
                        {totalDuration > 0 && (
                            <>
                                <span>•</span>
                                <span>{formatDuration(totalDuration)}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                {songs.length > 0 && (
                    <button 
                        className={styles.playButton}
                        onClick={() => play(songs[0], songs)}
                    >
                        ▶ Play
                    </button>
                )}
                <button 
                    className={styles.deleteButton}
                    onClick={handleDelete}
                >
                    Delete Playlist
                </button>
            </div>

            {/* Songs Content */}
            <div className={styles.playlistContent}>
                {songs.length > 0 ? (
                    <div className={styles.songsTable}>
                        {/* Table Header */}
                        <div className={styles.songsHeader}>
                            <span className={styles.headerNumber}>#</span>
                            <span className={styles.headerTitle}>Title</span>
                            <span className={styles.headerAlbum}>Album</span>
                            <span className={styles.headerDate}>Date Added</span>
                            <span className={styles.headerDuration}>Duration</span>
                        </div>
                        
                        {/* Song Rows */}
                        <div className={styles.songsList}>
                            {songs.map((song, index) => (
                                <div 
                                    key={song._id} 
                                    className={styles.songItem}
                                >
                                    <span className={styles.songNumber}>{index + 1}</span>
                                    <div className={styles.songInfo}>
                                        <div 
                                            className={styles.songTitle}
                                            onClick={() => handleSongClick(song, index)}
                                        >
                                            {song.title}
                                        </div>
                                        <div className={styles.songArtist}>
                                            {song.artist?.name || 'Unknown Artist'}
                                        </div>
                                    </div>
                                    <div className={styles.songAlbum}>
                                        {song.album?.title || '-'}
                                    </div>
                                    <div className={styles.songDate}>
                                        {song.createdAt ? formatDate(song.createdAt) : '-'}
                                    </div>
                                    <div className={styles.songDuration}>
                                        {formatDuration(song.duration)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className={styles.noContent}>This playlist is empty</p>
                )}
            </div>
        </div>
    )
}

export default PlaylistPage
