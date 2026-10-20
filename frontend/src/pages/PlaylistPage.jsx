import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchPlaylistById, deletePlaylist, followPlaylist, unfollowPlaylist, addCollaborator, removeCollaborator, removeSongFromPlaylist } from '../services/playlistService'
import { searchUsers } from '../services/userService'
import { formatDuration } from '../utils/formatDuration'
import { formatDate } from '../utils/formatDate'
import { getPlaylistGradient } from '../utils/playlistColor'
import { usePlayer } from '../hooks/usePlayer'
import { useAuth } from '../hooks/useAuth'
import { useLibrary } from '../hooks/useLibrary'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'
import Skeleton from '../components/Skeleton'
import styles from './PlaylistPage.module.css'

const PlaylistPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { play, currentSong } = usePlayer()
    const { user } = useAuth()
    const { isPlaylistFollowed, addFollowedPlaylist, removeFollowedPlaylist, removePlaylist, refreshPlaylists } = useLibrary()

    const [playlist, setPlaylist] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [collaboratorSearch, setCollaboratorSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const { toast, showToast, clearToast } = useToast()

    // Move loadPlaylistData outside useEffect for reuse
    const loadPlaylistData = async (signal) => {
        try {
            setLoading(true)
            setError(null)
            const playlistData = await fetchPlaylistById(id, signal)
            setPlaylist(playlistData)
        } catch (err) {
            if (err.name === 'AbortError') return
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        loadPlaylistData(controller.signal)
        return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    // Defensive: handle owner as object or string or null
    let ownerId = null
    if (playlist && playlist.owner) {
        if (typeof playlist.owner === 'object' && playlist.owner._id) {
            ownerId = String(playlist.owner._id)
        } else {
            ownerId = String(playlist.owner)
        }
    }
    const isOwner = user && ownerId && String(ownerId) === String(user.id)
    const isCollaborator = user && playlist?.collaborators?.some(c => c._id === user.id)
    const isSystemPlaylist = playlist?.isSystemPlaylist
    const canManageSongs = (isOwner || isCollaborator) && !isSystemPlaylist
    const followed = isPlaylistFollowed(id)

    const handleSongClick = (song) => {
        play(song, playlist.songs)
    }

    const handleDelete = async () => {
        try {
            await deletePlaylist(id)
            removePlaylist(id)
            navigate('/library')
        } catch (err) {
            setShowDeleteConfirm(false)
            showToast('Failed to delete playlist: ' + err.message)
        }
    }

    const handleFollow = async () => {
        try {
            await followPlaylist(id)
            addFollowedPlaylist(playlist)
        } catch (err) {
            showToast('Failed to follow playlist: ' + err.message)
        }
    }

    const handleUnfollow = async () => {
        try {
            await unfollowPlaylist(id)
            removeFollowedPlaylist(id)
        } catch (err) {
            showToast('Failed to unfollow playlist: ' + err.message)
        }
    }

    const handleCollaboratorSearch = async (value) => {
        setCollaboratorSearch(value)
        if (!value.trim()) { setSearchResults([]); return }
        setSearchLoading(true)
        try {
            const results = await searchUsers(value.trim())
            const collaboratorIds = new Set(playlist.collaborators?.map(c => c._id) ?? [])
            setSearchResults(results.filter(u => u._id !== String(user?.id) && !collaboratorIds.has(u._id)))
        } catch {
            setSearchResults([])
        } finally {
            setSearchLoading(false)
        }
    }

    const handleAddCollaborator = async (userId) => {
        try {
            await addCollaborator(id, userId)
            setCollaboratorSearch('')
            setSearchResults([])
            await loadPlaylistData()
        } catch (err) {
            showToast('Failed to add collaborator: ' + err.message)
        }
    }

    const handleRemoveCollaborator = async (userId) => {
        try {
            await removeCollaborator(id, userId)
            await loadPlaylistData()
        } catch (err) {
            showToast('Failed to remove collaborator: ' + err.message)
        }
    }

    const handleRemoveSong = async (songId) => {
        try {
            await removeSongFromPlaylist(id, songId)
            setPlaylist(prev => ({
                ...prev,
                songs: prev.songs.filter(s => s._id !== songId)
            }))
            refreshPlaylists()
        } catch (err) {
            showToast('Failed to remove song: ' + err.message)
        }
    }

    if (loading) return (
        <div className={styles.playlistPage}>
            <div className={styles.playlistHeader}>
                <Skeleton width="232px" height="232px" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'flex-end' }}>
                    <Skeleton width="70px"  height="12px" />
                    <Skeleton width="260px" height="40px" />
                    <Skeleton width="160px" height="16px" />
                </div>
            </div>
            <div style={{ display: 'flex', gap: 12, margin: '24px 0' }}>
                <Skeleton width="48px" height="48px" borderRadius="50%" />
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '10px 0' }}>
                    <Skeleton width="20px" height="16px" />
                    <Skeleton width="55%"  height="16px" />
                    <Skeleton width="15%"  height="16px" style={{ marginLeft: 'auto' }} />
                </div>
            ))}
        </div>
    )
    if (error) return (
        <div className={styles.playlistPage}>
            <p>Error: {error}</p>
            <button onClick={() => loadPlaylistData()}>Try Again</button>
        </div>
    )
    if (!playlist) return <div className={styles.playlistPage}>Playlist not found</div>


    // Defensive: Only use valid songs with _id
    const songs = Array.isArray(playlist.songs)
        ? playlist.songs.filter(song => song && song._id)
        : []

    const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0)
    const ownerName = isSystemPlaylist
        ? 'Sunami'
        : (playlist.owner && typeof playlist.owner === 'object' && playlist.owner.username)
            ? playlist.owner.username
            : 'Unknown'

    return (
        <div className={styles.playlistPage}>
            <Toast toast={toast} onDismiss={clearToast} />
            {/* Playlist Header */}
            <div className={styles.playlistHeader}>
                <div
                    className={styles.playlistCover}
                    style={{ background: getPlaylistGradient(playlist.name) }}
                />
                <div className={styles.playlistInfo}>
                    <p className={styles.playlistType}>
                        {isSystemPlaylist ? 'Sunami Playlist' : 'Playlist'}
                    </p>
                    <h1 className={styles.playlistTitle}>{playlist.name}</h1>
                    {playlist.description && (
                        <p className={styles.playlistDescription}>{playlist.description}</p>
                    )}
                    <div className={styles.playlistMeta}>
                        <span className={styles.playlistOwner}>{ownerName}</span>
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
                {/* Delete — top-right of header, owner only */}
                {isOwner && (
                    <div className={styles.playlistActions}>
                        {showDeleteConfirm ? (
                            <div className={styles.deleteConfirm}>
                                <span className={styles.deleteConfirmText}>Delete this playlist?</span>
                                <button className={styles.deleteConfirmBtn} onClick={handleDelete}>Delete</button>
                                <button className={styles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                            </div>
                        ) : (
                            <button className={styles.deleteButton} onClick={() => setShowDeleteConfirm(true)}>
                                Delete Playlist
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                {songs.length > 0 && (
                    <button className={styles.playButton} onClick={() => play(songs[0], songs)}>
                        ▶ Play
                    </button>
                )}

                {/* Follow/Unfollow — shown to logged-in non-owners */}
                {user && !isOwner && (
                    followed
                        ? <button className={`${styles.followButton} ${styles.following}`} onClick={handleUnfollow}>Unfollow</button>
                        : <button className={styles.followButton} onClick={handleFollow}>Follow</button>
                )}
            </div>

            {/* Collaborator Management — owner only, not on system playlists */}
            {isOwner && !isSystemPlaylist && (
                <div className={styles.collaborators}>
                    <h3>Collaborators</h3>

                    {/* Current collaborators */}
                    {playlist.collaborators?.length > 0 ? (
                        <ul className={styles.collaboratorList}>
                            {playlist.collaborators.map(c => (
                                <li key={c._id} className={styles.collaboratorItem}>
                                    <span>{c.username}</span>
                                    <button onClick={() => handleRemoveCollaborator(c._id)}>
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No collaborators yet</p>
                    )}

                    {/* Add collaborator by username search */}
                    <div className={styles.addCollaborator}>
                        <div className={styles.searchWrapper}>
                            <input
                                type="text"
                                placeholder="Search by username..."
                                value={collaboratorSearch}
                                onChange={(e) => handleCollaboratorSearch(e.target.value)}
                                autoComplete="off"
                            />
                            {(searchResults.length > 0 || searchLoading) && (
                                <ul className={styles.searchDropdown}>
                                    {searchLoading && (
                                        <li className={styles.searchHint}>Searching...</li>
                                    )}
                                    {!searchLoading && searchResults.map(u => (
                                        <li
                                            key={u._id}
                                            className={styles.searchResult}
                                            onClick={() => handleAddCollaborator(u._id)}
                                        >
                                            {u.username}
                                        </li>
                                    ))}
                                    {!searchLoading && searchResults.length === 0 && collaboratorSearch && (
                                        <li className={styles.searchHint}>No users found</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Songs */}
            <div className={styles.playlistContent}>
                {songs.length > 0 ? (
                    <div className={styles.songsTable}>
                        <div className={styles.songsHeader}>
                            <span className={styles.headerNumber}>#</span>
                            <span className={styles.headerTitle}>Title</span>
                            <span className={styles.headerAlbum}>Album</span>
                            <span className={styles.headerDate}>Date Added</span>
                            <span className={styles.headerDuration}>Duration</span>
                            {canManageSongs && <span className={styles.headerActions}></span>}
                        </div>
                        <div className={styles.songsList}>
                            {songs.map((song, index) => (
                                <div key={song._id} className={`${styles.songItem} ${currentSong?._id === song._id ? styles.isPlaying : ''}`}>
                                    {currentSong?._id === song._id ? (
                                        <div className="equalizerBars">
                                            <span className="equalizerBar" />
                                            <span className="equalizerBar" />
                                            <span className="equalizerBar" />
                                        </div>
                                    ) : (
                                        <span className={styles.songNumber}>{index + 1}</span>
                                    )}
                                    <div className={styles.songInfo}>
                                        <div className={styles.songTitle} onClick={() => handleSongClick(song)}>
                                            {song.title}
                                        </div>
                                        <div className={styles.songArtist}>
                                            {song.artist?.name || 'Unknown Artist'}
                                        </div>
                                    </div>
                                    <div className={styles.songAlbum}>{song.album?.title || '-'}</div>
                                    <div className={styles.songDate}>
                                        {song.createdAt ? formatDate(song.createdAt) : '-'}
                                    </div>
                                    <div className={styles.songDuration}>
                                        {formatDuration(song.duration)}
                                    </div>
                                    {canManageSongs && (
                                        <button
                                            className={styles.removeSongBtn}
                                            onClick={() => handleRemoveSong(song._id)}
                                            title="Remove from playlist"
                                        >
                                            ✕
                                        </button>
                                    )}
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