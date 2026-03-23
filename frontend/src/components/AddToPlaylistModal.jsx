/**
 * AddToPlaylistModal
 * Modal dialog for adding a song to user's playlists
 */

import { useState, useEffect } from 'react'
import { fetchMyPlaylists, addSongToPlaylist } from '../services/playlistService'
import styles from './AddToPlaylistModal.module.css'

function AddToPlaylistModal({ isOpen, onClose, song }) {
    const [playlists, setPlaylists] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    useEffect(() => {
        if (isOpen) {
            fetchUserPlaylists()
        }
    }, [isOpen])

    const fetchUserPlaylists = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await fetchMyPlaylists()
            setPlaylists(data)
        } catch (err) {
            setError(err.message || 'Failed to load playlists')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddToPlaylist = async (playlistId) => {
        try {
            setIsAdding(true)
            setError(null)
            setSuccessMessage(null)
            
            await addSongToPlaylist(playlistId, song._id)
            
            setSuccessMessage('Song added to playlist!')
            
            // Close modal after brief success message
            setTimeout(() => {
                onClose()
                setSuccessMessage(null)
            }, 1500)
        } catch (err) {
            setError(err.message || 'Failed to add song to playlist')
            setIsAdding(false)
        }
    }

    const handleClose = () => {
        if (!isAdding) {
            setError(null)
            setSuccessMessage(null)
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Lägg till i spellista</h2>
                    <button 
                        className={styles.closeButton}
                        onClick={handleClose}
                        disabled={isAdding}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.songInfo}>
                    {song?.album?.coverImage && (
                        <img 
                            src={song.album.coverImage} 
                            alt={song.title}
                            className={styles.songImage}
                        />
                    )}
                    <div className={styles.songDetails}>
                        <div className={styles.songTitle}>{song?.title}</div>
                        <div className={styles.songArtist}>{song?.artist?.name}</div>
                    </div>
                </div>

                <div className={styles.content}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className={styles.success}>
                            {successMessage}
                        </div>
                    )}

                    {isLoading ? (
                        <div className={styles.loading}>Laddar spellistor...</div>
                    ) : playlists.length === 0 ? (
                        <div className={styles.empty}>
                            <p>Du har inga spellistor än.</p>
                            <p className={styles.emptyHint}>
                                Skapa en spellista för att börja lägga till låtar!
                            </p>
                        </div>
                    ) : (
                        <div className={styles.playlistList}>
                            {playlists.map((playlist) => (
                                <button
                                    key={playlist._id}
                                    className={styles.playlistItem}
                                    onClick={() => handleAddToPlaylist(playlist._id)}
                                    disabled={isAdding}
                                >
                                    <div className={styles.playlistIcon}>♫</div>
                                    <div className={styles.playlistInfo}>
                                        <div className={styles.playlistName}>{playlist.name}</div>
                                        <div className={styles.playlistMeta}>
                                            {playlist.songs?.length || 0} låtar
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AddToPlaylistModal
