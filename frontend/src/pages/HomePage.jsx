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
import { fetchAlbums, fetchAlbumsByIdWithSongs } from '../services/albumService'
import { getArtistRoute, getAlbumRoute, getPlaylistRoute } from '../constants/routes'
import { useLibrary } from '../hooks/useLibrary'
import { usePlayer } from '../hooks/usePlayer'
import { getPlaylistGradient } from '../utils/playlistColor'
import Skeleton from '../components/Skeleton'
import Card from '../components/Card'
import styles from './HomePage.module.css'

const HomePage = () => {
    const [artists, setArtists] = useState([])
    const [albums, setAlbums] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { library, loading: libraryLoading } = useLibrary()
    const { play } = usePlayer()

    const handlePlayAlbum = async (albumId) => {
        try {
            const data = await fetchAlbumsByIdWithSongs(albumId)
            const songs = data.songs || []
            if (songs.length > 0) play(songs[0], songs)
        } catch {
            // silently fail — user can still navigate to the album
        }
    }
    const sunamiPlaylists = (library?.allPlaylists || []).filter(p => p.isSystemPlaylist)

    const loadData = async (signal) => {
        try {
            setLoading(true)
            setError(null)
            const [artistsData, albumsData] = await Promise.all([
                fetchArtists(signal),
                fetchAlbums(signal)
            ])
            setArtists(artistsData)
            setAlbums(albumsData)
        } catch (err) {
            if (err.name === 'AbortError') return
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        loadData(controller.signal)
        return () => controller.abort()
    }, [])



    if (loading || libraryLoading) {
        return (
            <div className={`page ${styles.homePage}`}>
                {[0, 1].map(section => (
                    <section key={section} className={styles.section}>
                        <Skeleton width="160px" height="28px" style={{ marginBottom: 16 }} />
                        <div className={styles.albumsGrid}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className={styles.albumCard}>
                                    <Skeleton width="100%" height="180px" />
                                    <Skeleton width="80%" height="16px" style={{ marginTop: 12 }} />
                                    <Skeleton width="50%" height="13px" style={{ marginTop: 8 }} />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="page">
                <p>Error: {error}</p>
                <button onClick={() => loadData()}>Try Again</button>
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
                            <Card
                                key={artist._id}
                                to={getArtistRoute(artist._id)}
                                image={artist.image}
                                title={artist.name}
                                subtitle="Artist"
                                round
                            />
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
                            <Card
                                key={album._id}
                                to={getAlbumRoute(album._id)}
                                image={album.coverImage}
                                title={album.title}
                                subtitle={album.artist?.name || 'Unknown Artist'}
                                onPlay={() => handlePlayAlbum(album._id)}
                            />
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
                ) : (
                    <p className={styles.noContent}>No Sunami playlists available.</p>
                )}
            </section>
        </div>
    )
}

export default HomePage