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
import { getArtistRoute, getAlbumRoute } from '../constants/routes'
import styles from './HomePage.module.css'

const HomePage = () => {
    const [artists, setArtists] = useState([])
    const [albums, setAlbums] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const [artistsData, albumsData] = await Promise.all([
                fetchArtists(),
                fetchAlbums()
            ])
            
            setArtists(artistsData)
            setAlbums(albumsData)
        } catch (err) {
            setError(err.message)
            console.error('Error loading homepage data:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
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
        </div>
    )
}

export default HomePage