import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { searchSongs, fetchSongs } from '../services/songService'
import { fetchArtists } from '../services/artistService'
import { fetchAlbums } from '../services/albumService'
import { likeSong, unlikeSong } from '../services/userService'
import { getArtistRoute, getAlbumRoute, getPlaylistRoute } from '../constants/routes'
import { getPlaylistGradient } from '../utils/playlistColor'
import { formatDuration } from '../utils/formatDuration'
import { usePlayer } from '../hooks/usePlayer'
import { useAuth } from '../hooks/useAuth'
import { useLibrary } from '../hooks/useLibrary'
import { useToast } from '../hooks/useToast'
import AddToPlaylistModal from '../components/AddToPlaylistModal'
import Toast from '../components/Toast'
import { HeartIcon, PlusIcon } from '../components/Icons'
import styles from './SearchPage.module.css'

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [browseCategory, setBrowseCategory] = useState(null)
    const [searchResults, setSearchResults] = useState([])
    const [allArtists, setAllArtists] = useState([])
    const [allAlbums, setAllAlbums] = useState([])
    const [allSongs, setAllSongs] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)
    const { play, currentSong } = usePlayer()
    const { user } = useAuth()
    const { isSongLiked, addLikedSong, removeLikedSong, library } = useLibrary()
    const { toast, showToast, clearToast } = useToast()
    const sunamiPlaylists = (library?.allPlaylists || []).filter(p => p.isSystemPlaylist)
    const publicUserPlaylists = (library?.allPlaylists || []).filter(
        p => !p.isSystemPlaylist && p.isPublic
    )

    const filteredSunamiPlaylists = searchQuery.trim()
        ? sunamiPlaylists.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : []

    const filteredPlaylists = searchQuery.trim()
        ? publicUserPlaylists.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : []

    useEffect(() => {
        const controller = new AbortController()
        const loadBrowseData = async () => {
            try {
                const [artists, albums, songs] = await Promise.all([
                    fetchArtists(controller.signal),
                    fetchAlbums(controller.signal),
                    fetchSongs()
                ])
                setAllArtists(artists)
                setAllAlbums(albums)
                setAllSongs([...songs].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)))
            } catch (err) {
                if(err.name === 'AbortError') return
                console.error('Error loading browse data:', err)
            }
        }
        loadBrowseData()
        return () => controller.abort()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery])


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

    const handleSongClick = (song) => {
        play(song, searchResults)
    }

    const handleAddToPlaylist = (song) => {
        setSelectedSong(song)
        setIsPlaylistModalOpen(true)
    }

    const handleLikeSong = async (song) => {
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

    const clearSearch = () => {
        setSearchQuery('')
        setSearchResults([])
        setBrowseCategory(null)
    }
    
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
            <Toast toast={toast} onDismiss={clearToast} />
            {/* Search Input */}
            <div className={styles.searchBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="What do you want to listen to?"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setBrowseCategory(null) }}
                    autoFocus
                />
                {searchQuery && (
                    <button className={styles.clearButton} onClick={clearSearch}>
                        ✕
                    </button>
                )}
            </div>

            {/* Show browse all when no search */}
            {!searchQuery.trim() && !browseCategory && (
                <div className={styles.browseSection}>
                    <h2 className={styles.sectionTitle}>Browse All</h2>
                    <div className={styles.categoryGrid}>
                        <div className={`${styles.categoryCard} ${styles.categoryArtists}`} onClick={() => setBrowseCategory('artists')}>
                            <h3>Artists</h3>
                        </div>
                        <div className={`${styles.categoryCard} ${styles.categoryAlbums}`} onClick={() => setBrowseCategory('albums')}>
                            <h3>Albums</h3>
                        </div>
                        <div className={`${styles.categoryCard} ${styles.categorySongs}`} onClick={() => setBrowseCategory('songs')}>
                            <h3>Songs</h3>
                        </div>
                        <div className={`${styles.categoryCard} ${styles.categoryPlaylists}`} onClick={() => setBrowseCategory('playlists')}>
                            <h3>Playlists</h3>
                        </div>
                    </div>
                    {/* Sunami Playlists Section */}
                    {sunamiPlaylists.length > 0 && (
                        <div className={styles.sunamiSection}>
                            <h2 className={styles.sectionTitle}>Sunami Playlists</h2>
                            <div className={styles.albumsGrid}>
                                {sunamiPlaylists.map((playlist) => (
                                    <Link
                                        key={playlist._id}
                                        to={getPlaylistRoute(playlist._id)}
                                        className={styles.albumCard}
                                    >
                                        <div
                                            className={styles.playlistCover}
                                            style={{ background: getPlaylistGradient(playlist.name) }}
                                        />
                                        <div className={styles.albumInfo}>
                                            <h3 className={styles.albumTitle}>{playlist.name}</h3>
                                            <p className={styles.albumArtist}>{playlist.songs?.length || 0} songs</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Show all public playlists if Playlists category is selected */}
            {!searchQuery.trim() && browseCategory === 'playlists' && (
                <div className={styles.browseSection}>
                    <button className={styles.backButton} onClick={() => setBrowseCategory(null)}>
                        ← Back
                    </button>
                    <h2 className={styles.sectionTitle}>All Public Playlists</h2>
                    <div className={styles.albumsGrid}>
                        {publicUserPlaylists.length === 0 && <p>No public playlists found.</p>}
                        {publicUserPlaylists.map((playlist) => (
                            <Link
                                key={playlist._id}
                                to={getPlaylistRoute(playlist._id)}
                                className={styles.albumCard}
                            >
                                {/* Playlist cover image or fallback */}
                                <div
                                    className={styles.playlistCover}
                                    style={{ background: getPlaylistGradient(playlist.name) }}
                                />
                                <div className={styles.albumInfo}>
                                    <h3 className={styles.albumTitle}>{playlist.name}</h3>
                                    <p className={styles.albumArtist}>By {playlist.owner?.username || 'Unknown'}</p>
                                    <p className={styles.albumArtist}>{playlist.songs?.length || 0} songs</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            {/* Browse Artists */}
            {!searchQuery.trim() && browseCategory === 'artists' && (
                <div className={styles.browseSection}>
                    <button className={styles.backButton} onClick={() => setBrowseCategory(null)}>
                        ← Back
                    </button>
                    <h2 className={styles.sectionTitle}>All Artists</h2>
                    <div className={styles.artistsGrid}>
                        {allArtists.map((artist) => (
                            <Link key={artist._id} to={getArtistRoute(artist._id)} className={styles.artistCard}>
                                {artist.image && (
                                    <img src={artist.image} alt={artist.name} className={styles.artistImage} />
                                )}
                                <div className={styles.artistInfo}>
                                    <h3 className={styles.artistName}>{artist.name}</h3>
                                    <p className={styles.artistMeta}>Artist</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Browse Albums */}
            {!searchQuery.trim() && browseCategory === 'albums' && (
                <div className={styles.browseSection}>
                    <button className={styles.backButton} onClick={() => setBrowseCategory(null)}>
                        ← Back
                    </button>
                    <h2 className={styles.sectionTitle}>All Albums</h2>
                    <div className={styles.albumsGrid}>
                        {allAlbums.map((album) => (
                            <Link key={album._id} to={getAlbumRoute(album._id)} className={styles.albumCard}>
                                {album.coverImage && (
                                    <img src={album.coverImage} alt={album.title} className={styles.albumCover} />
                                )}
                                <div className={styles.albumInfo}>
                                    <h3 className={styles.albumTitle}>{album.title}</h3>
                                    <p className={styles.albumArtist}>{album.artist?.name || 'Unknown Artist'}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Browse Songs */}
            {!searchQuery.trim() && browseCategory === 'songs' && (
                <div className={styles.browseSection}>
                    <button className={styles.backButton} onClick={() => setBrowseCategory(null)}>
                        ← Back
                    </button>
                    <h2 className={styles.sectionTitle}>Popular Songs</h2>
                    <div className={styles.songsList}>
                        {allSongs.slice(0, 50).map((song) => (
                            <div key={song._id} className={`${styles.songItem} ${currentSong?._id === song._id ? styles.isPlaying : ''}`}>
                                {song.album?.coverImage && (
                                    <div className={styles.songImageWrapper}>
                                        <img src={song.album.coverImage} alt={song.title} className={styles.songImage} />
                                        {currentSong?._id === song._id && (
                                            <div className={`${styles.songImageOverlay} equalizerBars`}>
                                                <span className="equalizerBar" />
                                                <span className="equalizerBar" />
                                                <span className="equalizerBar" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={styles.songInfo}>
                                    <div className={styles.songTitle} onClick={() => play(song, allSongs)}>
                                        {song.title}
                                    </div>
                                    <div className={styles.songMeta}>{song.artist?.name}</div>
                                </div>
                                <div className={styles.songDuration}>{formatDuration(song.duration)}</div>
                                {user && (
                                    <div className={styles.songActions}>
                                        <button
                                            className={`${styles.iconButton} ${isSongLiked(song._id) ? styles.liked : ''}`}
                                            onClick={() => handleLikeSong(song)}
                                            title={isSongLiked(song._id) ? 'Remove from liked songs' : 'Add to liked songs'}
                                        >
                                            <HeartIcon filled={isSongLiked(song._id)} />
                                        </button>
                                        <button
                                            className={styles.addButton}
                                            onClick={() => { setSelectedSong(song); setIsPlaylistModalOpen(true) }}
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
            )}

            {/* User Public Playlists in search results */}
            {searchQuery.trim() && !loading && !error && filteredPlaylists.length > 0 && (
                <section className={styles.resultCategory}>
                    <h2 className={styles.categoryTitle}>Playlists</h2>
                    <div className={styles.albumsGrid}>
                        {filteredPlaylists.map((playlist) => (
                            <Link
                                key={playlist._id}
                                to={getPlaylistRoute(playlist._id)}
                                className={styles.albumCard}
                            >
                                <div
                                    className={styles.playlistCover}
                                    style={{ background: getPlaylistGradient(playlist.name) }}
                                />
                                <div className={styles.albumInfo}>
                                    <h3 className={styles.albumTitle}>{playlist.name}</h3>
                                    <p className={styles.albumArtist}>By {playlist.owner?.username || 'Unknown'}</p>
                                    <p className={styles.albumArtist}>{playlist.songs?.length || 0} songs</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            {/* Sunami Playlists in search results */}
            {searchQuery.trim() && !loading && !error && filteredSunamiPlaylists.length > 0 && (
                <section className={styles.resultCategory}>
                    <h2 className={styles.categoryTitle}>Sunami Playlists</h2>
                    <div className={styles.grid}>
                        {filteredSunamiPlaylists
                            .map((playlist) => (
                                <Link
                                    key={playlist._id}
                                    to={getPlaylistRoute(playlist._id)}
                                    className={styles.card}
                                >
                                    <div
                                        className={styles.playlistCover}
                                        style={{ background: getPlaylistGradient(playlist.name) }}
                                    />
                                    <div className={styles.cardInfo}>
                                        <h3 className={styles.cardTitle}>{playlist.name}</h3>
                                        <p className={styles.cardMeta}>{playlist.songs?.length || 0} songs</p>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </section>
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
                                                className={`${styles.songItem} ${currentSong?._id === song._id ? styles.isPlaying : ''}`}
                                            >
                                                {song.album?.coverImage && (
                                                    <div className={styles.songImageWrapper}>
                                                        <img src={song.album.coverImage} alt={song.title} className={styles.songImage} />
                                                        {currentSong?._id === song._id && (
                                                            <div className={`${styles.songImageOverlay} equalizerBars`}>
                                                                <span className="equalizerBar" />
                                                                <span className="equalizerBar" />
                                                                <span className="equalizerBar" />
                                                            </div>
                                                        )}
                                                    </div>
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
