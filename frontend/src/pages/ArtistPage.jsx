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
import AddToPlaylistModal from "../components/AddToPlaylistModal"
import styles from "./ArtistPage.module.css"

/**
 * ArtistPage - Shows ONE artist's details
 * URL: /artist/:id (e.g., /artist/123)
 */
const ArtistPage = () => {
  const { id } = useParams() // Get artist ID from URL
  const { play } = usePlayer() // Get play function from player context
  const { user } = useAuth() // Get user to check authentication
  const { isSongLiked, addLikedSong, removeLikedSong, isArtistFollowed, addFollowedArtist, removeFollowedArtist } = useLibrary()
  
  const [artist, setArtist] = useState(null)
  const [songs, setSongs] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
  const [selectedSong, setSelectedSong] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const loadArtistData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch artist details, songs, and albums in parallel
        const [artistData, songsData, albumsData] = await Promise.all([
          fetchArtistsById(id, controller.signal),
          fetchArtistsByIdWithSongs(id, controller.signal),
          fetchArtistsByIdWithAlbums(id, controller.signal)
        ])
        
        setArtist(artistData)
        setSongs(songsData.songs || [])
        setAlbums(albumsData || [])
      } catch (err) {
        if(err.name === 'AbortError') return
        setError(err.message)
        console.error('Error fetching artist:', err)
      } finally {
        setLoading(false)
      }
    }
    loadArtistData()
    return () => controller.abort()
  }, [id])


  if (loading) {
    return <div className="page">Loading artist...</div>
  }

  if (error) {
    return (
      <div className="page">
        <p>Error: {error}</p>
        <button onClick={loadArtistData}>Try Again</button>
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
  const handleSongClick = (song, index) => {
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

  const handleFollowArtist = async () => {
    try {
      const isFollowing = isArtistFollowed(id)
      console.log('Toggling follow for artist:', id, 'Current state:', isFollowing)
      
      if (isFollowing) {
        const response = await unfollowArtist(id)
        console.log('Unfollow response:', response)
        removeFollowedArtist(id)
      } else {
        const response = await followArtist(id)
        console.log('Follow response:', response)
        addFollowedArtist(id)
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
      alert('Failed to follow/unfollow artist: ' + err.message)
    }
  }

  return (
    <div className={`page ${styles.artistPage}`}>
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


