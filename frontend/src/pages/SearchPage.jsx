/**
 * SearchPage
 * Search for songs, albums, artists
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { searchSongs } from '../services/songService'
import { fetchArtists } from '../services/artistService'
import { fetchAlbums } from '../services/albumService'
import { likeSong, unlikeSong } from '../services/userService'
import { getArtistRoute, getAlbumRoute } from '../constants/routes'
import { formatDuration } from '../utils/formatDuration'
import { usePlayer } from '../hooks/usePlayer'
import { useAuth } from '../hooks/useAuth'
import { useLibrary } from '../hooks/useLibrary'
import AddToPlaylistModal from '../components/AddToPlaylistModal'
import styles from './SearchPage.module.css'

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [allArtists, setAllArtists] = useState([])
    const [allAlbums, setAllAlbums] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)
    const { play } = usePlayer()
    const { user } = useAuth()
    const { isSongLiked, addLikedSong, removeLikedSong } = useLibrary()

    // Load browse all data on mount
    useEffect(() => {
        loadBrowseData()
    }, [])

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([])
            return
        }

        const timer = setTimeout(() => {
            performSearch()
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const loadBrowseData = async () => {
        try {
            const [artists, albums] = await Promise.all([
                fetchArtists(),
                fetchAlbums()
            ])
            setAllArtists(artists)
            setAllAlbums(albums)
        } catch (err) {
            console.error('Error loading browse data:', err)
        }
    }

    const performSearch = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const results = await searchSongs(searchQuery)
            setSearchResults(results)
        } catch (err) {
            setError(err.message)
            console.error('Error searching:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSongClick = (song, index) => {
        play(song, searchResults)
    }

    const handleAddToPlaylist = (song) => {
        setSelectedSong(song)
        setIsPlaylistModalOpen(true)
    }

    const handleLikeSong = async (song) => {
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

    const clearSearch = () => {
        setSearchQuery('')
        setSearchResults([])
    }

    // Filter artists and albums based on search query
    const filteredArtists = searchQuery.trim() 
        ? allArtists.filter(artist => 
            artist.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : []

    const filteredAlbums = searchQuery.trim()
        ? allAlbums.filter(album => 
            album.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : []

    return (
        <div className={`page ${styles.searchPage}`}>
            {/* Search Input */}
            <div className={styles.searchBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="What do you want to listen to?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                />
                {searchQuery && (
                    <button className={styles.clearButton} onClick={clearSearch}>
                        ✕
                    </button>
                )}
            </div>

            {/* Show browse all when no search */}
            {!searchQuery.trim() && (
                <div className={styles.browseSection}>
                    <h2 className={styles.sectionTitle}>Browse All</h2>
                    
                    <div className={styles.categoryGrid}>
                        <div className={styles.categoryCard} style={{ backgroundColor: '#1db954' }}>
                            <h3>Artists</h3>
                        </div>
                        <div className={styles.categoryCard} style={{ backgroundColor: '#e13300' }}>
                            <h3>Albums</h3>
                        </div>
                        <div className={styles.categoryCard} style={{ backgroundColor: '#8d67ab' }}>
                            <h3>Songs</h3>
                        </div>
                        <div className={styles.categoryCard} style={{ backgroundColor: '#bc5900' }}>
                            <h3>Playlists</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Results */}
            {searchQuery.trim() && (
                <div className={styles.resultsSection}>
                    {loading && <p className={styles.loadingText}>Searching...</p>}
                    
                    {error && <p className={styles.errorText}>Error: {error}</p>}

                    {!loading && !error && (
                        <>
                            {/* Songs Section */}
                            {searchResults.length > 0 && (
                                <section className={styles.resultCategory}>
                                    <h2 className={styles.categoryTitle}>Songs</h2>
                                    <div className={styles.songsList}>
                                        {searchResults.slice(0, 10).map((song, index) => (
                                            <div
                                                key={song._id}
                                                className={styles.songItem}
                                            >
                                                {song.album?.coverImage && (
                                                    <img
                                                        src={song.album.coverImage}
                                                        alt={song.title}
                                                        className={styles.songImage}
                                                    />
                                                )}
                                                <div className={styles.songInfo}>
                                                    <div
                                                        className={styles.songTitle}
                                                        onClick={() => handleSongClick(song, index)}
                                                    >
                                                        {song.title}
                                                    </div>
                                                    <div className={styles.songMeta}>
                                                        {song.artist?.name}
                                                    </div>
                                                </div>
                                                <div className={styles.songDuration}>
                                                    {formatDuration(song.duration)}
                                                </div>
                                                {user && (
                                                    <div className={styles.songActions}>
                                                        <button
                                                            className={`${styles.iconButton} ${isSongLiked(song._id) ? styles.liked : ''}`}
                                                            onClick={() => handleLikeSong(song)}
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
                                </section>
                            )}

                            {/* Artists Section */}
                            {filteredArtists.length > 0 && (
                                <section className={styles.resultCategory}>
                                    <h2 className={styles.categoryTitle}>Artists</h2>
                                    <div className={styles.artistsGrid}>
                                        {filteredArtists.slice(0, 6).map((artist) => (
                                            <Link
                                                key={artist._id}
                                                to={getArtistRoute(artist._id)}
                                                className={styles.artistCard}
                                            >
                                                {artist.image && (
                                                    <img
                                                        src={artist.image}
                                                        alt={artist.name}
                                                        className={styles.artistImage}
                                                    />
                                                )}
                                                <div className={styles.artistInfo}>
                                                    <h3 className={styles.artistName}>{artist.name}</h3>
                                                    <p className={styles.artistMeta}>Artist</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Albums Section */}
                            {filteredAlbums.length > 0 && (
                                <section className={styles.resultCategory}>
                                    <h2 className={styles.categoryTitle}>Albums</h2>
                                    <div className={styles.albumsGrid}>
                                        {filteredAlbums.slice(0, 6).map((album) => (
                                            <Link
                                                key={album._id}
                                                to={getAlbumRoute(album._id)}
                                                className={styles.albumCard}
                                            >
                                                {album.coverImage && (
                                                    <img
                                                        src={album.coverImage}
                                                        alt={album.title}
                                                        className={styles.albumCover}
                                                    />
                                                )}
                                                <div className={styles.albumInfo}>
                                                    <h3 className={styles.albumTitle}>{album.title}</h3>
                                                    <p className={styles.albumArtist}>
                                                        {album.artist?.name || 'Unknown Artist'}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* No Results */}
                            {searchResults.length === 0 && filteredArtists.length === 0 && filteredAlbums.length === 0 && !loading && (
                                <p className={styles.noResults}>No results found for "{searchQuery}"</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Add to Playlist Modal */}
            <AddToPlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={() => setIsPlaylistModalOpen(false)}
                song={selectedSong}
            />
        </div>
    )
}

export default SearchPage
