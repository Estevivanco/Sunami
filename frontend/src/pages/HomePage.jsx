/**
 * HomePage
 * Main landing page
 * 
 * Displays:
 * - Featured Artists
 * - Popular Albums
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchArtists } from '../services/artistService'
import { fetchAlbums } from '../services/albumService'
import { getArtistRoute, getAlbumRoute, getPlaylistRoute } from '../constants/routes'
import { useLibrary } from '../hooks/useLibrary'
import styles from './HomePage.module.css'

const HomePage = () => {
    const [artists, setArtists] = useState([])
    const [albums, setAlbums] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { library, loading: libraryLoading } = useLibrary()
    const sunamiPlaylists = (library?.allPlaylists || []).filter(p => p.isSystemPlaylist)

    useEffect(() => {
        const controller = new AbortController()
        const loadData = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const [artistsData, albumsData] = await Promise.all([
                    fetchArtists(controller.signal),
                    fetchAlbums(controller.signal)
                ])
                
                setArtists(artistsData)
                setAlbums(albumsData)
            } catch (err) {
                if(err.name === 'AbortError') return
                setError(err.message)
                console.error('Error loading homepage data:', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
        return () => controller.abort()
    }, [])



    if (loading || libraryLoading) {
        return <div className="page">Loading...</div>
    }

    if (error) {
        return (
            <div className="page">
                <p>Error: {error}</p>
                <button onClick={loadData}>Try Again</button>
            </div>
        )
    }

    return (
        <div className={`page ${styles.homePage}`}>
            {/* Featured Artists Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Featured Artists</h2>
                {artists.length > 0 ? (
                    <div className={styles.artistsGrid}>
                        {artists.map((artist) => (
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
                ) : (
                    <p className={styles.noContent}>No artists available</p>
                )}
            </section>

            {/* Popular Albums Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Popular Albums</h2>
                {albums.length > 0 ? (
                    <div className={styles.albumsGrid}>
                        {albums.map((album) => (
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
                ) : (
                    <p className={styles.noContent}>No albums available</p>
                )}
            </section>
            {/* Sunami Playlists Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Sunami Playlists</h2>
                {sunamiPlaylists.length > 0 ? (
                    <div className={styles.albumsGrid}>
                        {sunamiPlaylists.map((playlist) => (
                            <Link
                                key={playlist._id}
                                to={getPlaylistRoute(playlist._id)}
                                className={styles.albumCard}
                            >
                                <div className={styles.albumCover} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#282828' }}>
                                    <span className={styles.playlistIcon} style={{ fontSize: 40 }}>🎵</span>
                                </div>
                                <div className={styles.albumInfo}>
                                    <h3 className={styles.albumTitle}>{playlist.name}</h3>
                                    <p className={styles.albumArtist}>{playlist.songs?.length || 0} songs</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noContent}>No Sunami playlists available.</p>
                )}
            </section>
        </div>
    )
}

export default HomePage