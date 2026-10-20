/**
 * ArtistPage
 * Individual artist detail page
 * 
 * Should display:
 * - Artist header (name, image, verified badge)
 * - Monthly listeners / followers count
 * - Follow button
 * - Popular tracks section (top 5-10)
 * - Albums section (all albums)
 * - Singles section
 * - Featured on playlists
 * - Related artists
 * - About section
 * 
 * Features:
 * - Play artist's top songs
 * - Follow/unfollow artist
 * - Click on album to navigate
 * - "See all" for albums
 * - Shuffle play
 * 
 * Uses:
 * - useParams to get artist ID from URL
 * - artistService.fetchArtistById(id)
 * - artistService.fetchArtistAlbums(id)
 * - Card component for albums
 * - Song list component
 */

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { fetchArtistsById, fetchArtistsByIdWithSongs, fetchArtistsByIdWithAlbums } from "../services/artistService"
import { likeSong, unlikeSong, followArtist, unfollowArtist } from "../services/userService"
import { getAlbumRoute } from "../constants/routes"
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
import styles from "./ArtistPage.module.css"

/**
 * ArtistPage - Shows ONE artist's details
 * URL: /artist/:id (e.g., /artist/123)
 */
const ArtistPage = () => {
  const { id } = useParams() // Get artist ID from URL
  const { play, currentSong } = usePlayer()
  const { user } = useAuth() // Get user to check authentication
  const { isSongLiked, addLikedSong, removeLikedSong, isArtistFollowed, addFollowedArtist, removeFollowedArtist } = useLibrary()
  const { toast, showToast, clearToast } = useToast()

  const [artist, setArtist] = useState(null)
  const [songs, setSongs] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)

  const loadArtistData = async (signal) => {
    try {
      setLoading(true)
      setError(null)
      const [artistData, songsData, albumsData] = await Promise.all([
        fetchArtistsById(id, signal),
        fetchArtistsByIdWithSongs(id, signal),
        fetchArtistsByIdWithAlbums(id, signal)
      ])
      setArtist(artistData)
      setSongs(songsData.songs || [])
      setAlbums(albumsData || [])
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadArtistData(controller.signal)
    return () => controller.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])


  if (loading) {
    return (
      <div className={`page ${styles.artistPage}`}>
        <div className={styles.artistHeader}>
          <Skeleton width="200px" height="200px" borderRadius="50%" />
          <div className={styles.artistInfo} style={{ gap: 12 }}>
            <Skeleton width="240px" height="40px" />
            <Skeleton width="140px" height="16px" />
            <Skeleton width="110px" height="36px" borderRadius="24px" style={{ marginTop: 8 }} />
          </div>
        </div>
        <section className={styles.artistSection}>
          <Skeleton width="120px" height="24px" style={{ marginBottom: 16 }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '10px 0' }}>
              <Skeleton width="20px"  height="16px" />
              <Skeleton width="55%"   height="16px" />
              <Skeleton width="15%"   height="16px" style={{ marginLeft: 'auto' }} />
            </div>
          ))}
        </section>
        <section className={styles.artistSection}>
          <Skeleton width="100px" height="24px" style={{ marginBottom: 16 }} />
          <div className={styles.albumsGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.albumCard}>
                <Skeleton width="100%" height="160px" />
                <Skeleton width="75%"  height="16px" style={{ marginTop: 10 }} />
                <Skeleton width="45%"  height="13px" style={{ marginTop: 6  }} />
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <p>Error: {error}</p>
        <button onClick={() => loadArtistData()}>Try Again</button>
      </div>
    )
  }

  if (!artist) {
    return <div className="page">Artist not found</div>
  }

  // Sort songs by playCount (highest first) and take top 10
  const popularSongs = [...songs]
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 10)

  // Handle song click - play song and set queue
  const handleSongClick = (song) => {
    play(song, popularSongs)
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

  const handleFollowArtist = async () => {
    try {
      const isFollowing = isArtistFollowed(id)
      if (isFollowing) {
        await unfollowArtist(id)
        removeFollowedArtist(id)
      } else {
        await followArtist(id)
        addFollowedArtist(artist)
      }
    } catch (err) {
      showToast('Failed to follow/unfollow artist: ' + err.message)
    }
  }

  return (
    <div className={`page ${styles.artistPage}`}>
      <Toast toast={toast} onDismiss={clearToast} />
      {/* Artist Header */}
      <div className={styles.artistHeader}>
        {artist.image && (
          <img src={artist.image} alt={artist.name} className={styles.artistImage} />
        )}
        <div className={styles.artistInfo}>
          <h1 className={styles.artistName}>{artist.name}</h1>
          <div className={styles.artistMeta}>
            {artist.genres && artist.genres.length > 0 && (
              <span className={styles.artistGenre}>{artist.genres.join(', ').toUpperCase()}</span>
            )}
            {artist.country !== 'Unknown' && <span className={styles.artistCountry}>{artist.country}</span>}
          </div>
          {user && (
            <button
              className={`${styles.followButton} ${isArtistFollowed(id) ? styles.following : ''}`}
              onClick={handleFollowArtist}
              title={isArtistFollowed(id) ? 'Unfollow' : 'Follow'}
            >
              {isArtistFollowed(id) ? '✓ Following' : '+ Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Popular Tracks Section */}
      <section className={styles.artistSection}>
        <h2 className={styles.sectionTitle}>Popular</h2>
        {popularSongs && popularSongs.length > 0 ? (
          <div className={styles.songsTable}>
            {/* Table Header */}
            <div className={styles.tableHeader}>
              <span className={styles.headerNumber}>#</span>
              <span className={styles.headerTitle}>Title</span>
              <span className={styles.headerAlbum}>Album</span>
              <span className={styles.headerDate}>Date Added</span>
              <span className={styles.headerPlayCount}>Play Count</span>
              <span className={styles.headerDuration}>Duration</span>
            </div>
            
            {/* Table Rows */}
            <div className={styles.songsList}>
              {popularSongs.map((song, index) => (
                <div
                  key={song._id}
                  className={`${styles.songItem} ${currentSong?._id === song._id ? styles.isPlaying : ''}`}
                >
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
                    <div 
                      className={styles.songTitle}
                      onClick={() => handleSongClick(song, index)}
                    >
                      {song.title}
                    </div>
                    <div className={styles.songMeta}>{artist.name}</div>
                  </div>
                  <div className={styles.songAlbum}>
                    <Link
                    key={song.album?._id}
                    className={styles.songAlbumLink}
                    to={getAlbumRoute(song.album?._id)}>{song.album?.title || '-'}</Link></div>
                  <div className={styles.songDate}>{formatDate(song.createdAt)}</div>
                  <div className={styles.songPlayCount}>{formatNumberCompact(song.playCount)}</div>
                  <div className={styles.songDuration}>{formatDuration(song.duration)}</div>
                  {user && (
                    <div className={styles.songActions}>
                      <button
                        className={`${styles.iconButton} ${isSongLiked(song._id) ? styles.liked : ''}`}
                        onClick={(e) => handleLikeSong(song, e)}
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
          </div>
        ) : (
          <p className={styles.noContent}>No songs available</p>
        )}
        {songs.length > 10 && (
          <p className={styles.contentInfo}>Showing {popularSongs.length} of {songs.length} songs</p>
        )}
      </section>

      {/* Albums Section */}
      <section className={styles.artistSection}>
        <h2 className={styles.sectionTitle}>Albums</h2>
        {albums && albums.length > 0 ? (
          <div className={styles.albumsGrid}>
            {albums.map((album) => (
              <Link 
                key={album._id} 
                to={getAlbumRoute(album._id)} 
                className={styles.albumCard}
              >
                {album.coverImage && (
                  <img src={album.coverImage} alt={album.title} className={styles.albumCover} />
                )}
                <div className={styles.albumInfo}>
                  <h3 className={styles.albumTitle}>{album.title}</h3>
                  <p className={styles.albumYear}>{album.releaseDate ? new Date(album.releaseDate).getFullYear() : 'Unknown'}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.noContent}>No albums available</p>
        )}
      </section>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        song={selectedSong}
      />
    </div>
  )
}

export default ArtistPage


