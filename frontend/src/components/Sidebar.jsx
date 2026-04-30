import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { useLibrary } from '../hooks/useLibrary'  // ✅ added
import { createPlaylist } from '../services/playlistService'  // ✅ removed fetchMyPlaylists
import CreatePlaylistModal from './CreatePlaylistModal'
import styles from './Sidebar.module.css'

function Sidebar() {
    const { isLoggedIn } = useAuth()
    const { library, loading, addPlaylist } = useLibrary()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleCreatePlaylist = async (playlistData) => {
        const newPlaylist = await createPlaylist(playlistData)
        addPlaylist(newPlaylist)
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

            {isLoggedIn && (  // ✅ boolean, no function call
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
                        ) : library.playlists?.length === 0 ? (  // ✅ library.playlists
                            <p className={styles.emptyText}>Inga spellistor än</p>
                        ) : (
                            library.playlists?.map((playlist) => (  // ✅ library.playlists
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