import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { createPlaylist, fetchMyPlaylists } from '../services/playlistService'
import CreatePlaylistModal from './CreatePlaylistModal'
import styles from './Sidebar.module.css'

/**
 * Sidebar Component
 * Left sidebar with main navigation and playlists
 */
function Sidebar() {
  const { isAuthenticated } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      loadPlaylists()
    }
  }, [isAuthenticated])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      const data = await fetchMyPlaylists()
      setPlaylists(data)
    } catch (error) {
      console.error('Failed to load playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async (playlistData) => {
    const newPlaylist = await createPlaylist(playlistData)
    console.log('Created playlist:', newPlaylist)
    // Reload playlists to show the new one
    await loadPlaylists()
    return newPlaylist
  }

  return (
    <aside className={styles.sidebar}>
      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreatePlaylist={handleCreatePlaylist}
      />

      <div className={styles.logo}>
        <Link to={ROUTES.HOME}><h1>S U N A M I</h1></Link>
      </div>
      
      <nav className={styles.sidebarNav}>
        <Link to={ROUTES.HOME} className={styles.navLink}>
          <span className="icon">🏠</span>
          <span>Home</span>
        </Link>
        <Link to={ROUTES.SEARCH} className={styles.navLink}>
          <span className="icon">🔍</span>
          <span>Search</span>
        </Link>
        <Link to={ROUTES.LIBRARY} className={styles.navLink}>
          <span className="icon">📚</span>
          <span>Your Library</span>
        </Link>
      </nav>

      {isAuthenticated() && (
        <div className={styles.sidebarPlaylists}>
          <div className={styles.playlistsHeader}>
            <h3>Spellistor</h3>
            <button 
              className={styles.createPlaylistBtn}
              onClick={() => setIsModalOpen(true)}
              title="Skapa spellista"
            >
              +
            </button>
          </div>
          <div className={styles.playlistsList}>
            {loading ? (
              <p className={styles.loadingText}>Laddar...</p>
            ) : playlists.length === 0 ? (
              <p className={styles.emptyText}>Inga spellistor än</p>
            ) : (
              playlists.map((playlist) => (
                <Link 
                  key={playlist._id} 
                  to={`/playlist/${playlist._id}`}
                  className={styles.playlistItem}
                >
                  <span className={styles.playlistIcon}>
                    {playlist.isPublic ? '🎵' : '🔒'}
                  </span>
                  <span className={styles.playlistName}>{playlist.name}</span>
                  <span className={styles.playlistCount}>
                    {playlist.songs?.length || 0}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

