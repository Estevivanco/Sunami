/**
 * LibraryPage
 * User's personal library - displays liked songs, playlists, saved albums, and followed artists
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyPlaylists, createPlaylist } from '../services/playlistService'
import { getPlaylistRoute, getArtistRoute, getAlbumRoute } from '../constants/routes'
import { formatDuration } from '../utils/formatDuration'
import { useLibrary } from '../hooks/useLibrary'
import { usePlayer } from '../hooks/usePlayer'
import CreatePlaylistModal from '../components/CreatePlaylistModal'
import styles from './LibraryPage.module.css'

const LibraryPage = () => {
    const [activeTab, setActiveTab] = useState('songs') // songs, playlists, artists, albums
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { library, loading: libraryLoading } = useLibrary()
    const { play } = usePlayer()

    useEffect(() => {
        loadPlaylists()
    }, [])

    const loadPlaylists = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const playlistsData = await fetchMyPlaylists()
            setPlaylists(playlistsData)
        } catch (err) {
            setError(err.message)
            console.error('Error loading playlists:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePlaylist = async (playlistData) => {
        const newPlaylist = await createPlaylist(playlistData)
        setPlaylists([newPlaylist, ...playlists])
        return newPlaylist
    }

    const handleSongClick = (song, songs) => {
        play(song, songs)
    }

    if (loading || libraryLoading) {
        return <div className={styles.libraryPage}>Loading library...</div>
    }

    if (error) {
        return (
            <div className={styles.libraryPage}>
                <p>Error: {error}</p>
                <button onClick={loadPlaylists}>Try Again</button>
            </div>
        )
    }

    const likedSongs = library.likedSongs || []
    const savedAlbums = library.savedAlbums || []
    const followedArtists = library.followedArtists || []

    return (
        <div className={styles.libraryPage}>
            {/* Create Playlist Modal */}
            <CreatePlaylistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreatePlaylist={handleCreatePlaylist}
            />

            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Your Library</h1>
                {activeTab === 'playlists' && (
                    <button 
                        className={styles.createButton}
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Create Playlist
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'songs' ? styles.active : ''}`}
                    onClick={() => setActiveTab('songs')}
                >
                    Liked Songs
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'playlists' ? styles.active : ''}`}
                    onClick={() => setActiveTab('playlists')}
                >
                    Playlists
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'albums' ? styles.active : ''}`}
                    onClick={() => setActiveTab('albums')}
                >
                    Albums
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'artists' ? styles.active : ''}`}
                    onClick={() => setActiveTab('artists')}
                >
                    Artists
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Liked Songs Tab */}
                {activeTab === 'songs' && (
                    <div className={styles.songsList}>
                        {likedSongs.length > 0 ? (
                            likedSongs.map((song, index) => (
                                <div
                                    key={song._id}
                                    className={styles.songItem}
                                    onClick={() => handleSongClick(song, likedSongs)}
                                >
                                    {song.album?.coverImage && (
                                        <img
                                            src={song.album.coverImage}
                                            alt={song.title}
                                            className={styles.songImage}
                                        />
                                    )}
                                    <div className={styles.songInfo}>
                                        <div className={styles.songTitle}>{song.title}</div>
                                        <div className={styles.songMeta}>
                                            {song.artist?.name}
                                        </div>
                                    </div>
                                    <div className={styles.songAlbum}>
                                        {song.album?.title || '-'}
                                    </div>
                                    <div className={styles.songDuration}>
                                        {formatDuration(song.duration)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noContent}>No liked songs yet. Start liking songs to build your library!</p>
                        )}
                    </div>
                )}

                {/* Playlists Tab */}
                {activeTab === 'playlists' && (
                    <div className={styles.grid}>
                        {playlists.length > 0 ? (
                            playlists.map((playlist) => (
                                <Link
                                    key={playlist._id}
                                    to={getPlaylistRoute(playlist._id)}
                                    className={styles.card}
                                >
                                    <div className={styles.playlistCover}>
                                        <span className={styles.playlistIcon}>🎵</span>
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <h3 className={styles.cardTitle}>{playlist.name}</h3>
                                        <p className={styles.cardMeta}>
                                            {playlist.songs?.length || 0} songs
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className={styles.noContent}>No playlists yet. Create one to get started!</p>
                        )}
                    </div>
                )}

                {/* Albums Tab */}
                {activeTab === 'albums' && (
                    <div className={styles.grid}>
                        {savedAlbums.length > 0 ? (
                            savedAlbums.map((album) => (
                                <Link
                                    key={album._id}
                                    to={getAlbumRoute(album._id)}
                                    className={styles.card}
                                >
                                    {album.coverImage && (
                                        <img
                                            src={album.coverImage}
                                            alt={album.title}
                                            className={styles.albumCover}
                                        />
                                    )}
                                    <div className={styles.cardInfo}>
                                        <h3 className={styles.cardTitle}>{album.title}</h3>
                                        <p className={styles.cardMeta}>
                                            {album.artist?.name || 'Unknown Artist'}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className={styles.noContent}>No saved albums. Save albums to see them here!</p>
                        )}
                    </div>
                )}

                {/* Artists Tab */}
                {activeTab === 'artists' && (
                    <div className={styles.grid}>
                        {followedArtists.length > 0 ? (
                            followedArtists.map((artist) => (
                                <Link
                                    key={artist._id}
                                    to={getArtistRoute(artist._id)}
                                    className={styles.card}
                                >
                                    {artist.image && (
                                        <img
                                            src={artist.image}
                                            alt={artist.name}
                                            className={styles.artistImage}
                                        />
                                    )}
                                    <div className={styles.cardInfo}>
                                        <h3 className={styles.cardTitle}>{artist.name}</h3>
                                        <p className={styles.cardMeta}>Artist</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className={styles.noContent}>No followed artists. Follow artists to see them here!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LibraryPage
