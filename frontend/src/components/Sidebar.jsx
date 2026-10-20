import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { useLibrary } from '../hooks/useLibrary'  // ✅ added
import { createPlaylist } from '../services/playlistService'
import { getPlaylistGradient } from '../utils/playlistColor'
import CreatePlaylistModal from './CreatePlaylistModal'
import { PlusIcon } from './Icons'
import styles from './Sidebar.module.css'

function Sidebar() {
    const { isLoggedIn } = useAuth()
    const { library, loading, addPlaylist } = useLibrary()
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Own playlists first, then followed ones (de-duplicated)
    const ownIds = new Set((library.playlists || []).map(p => p._id))
    const sidebarPlaylists = [
        ...(library.playlists || []),
        ...(library.followedPlaylists || []).filter(p => p && p._id && !ownIds.has(p._id))
    ]

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
                        <h3>Playlists</h3>
                        <button
                            className={styles.createPlaylistBtn}
                            onClick={() => setIsModalOpen(true)}
                            title="Create playlist"
                        >
                            <PlusIcon size={16} />
                        </button>
                    </div>
                    <div className={styles.playlistsList}>
                        {loading ? (
                            <p className={styles.loadingText}>Loading...</p>
                        ) : sidebarPlaylists.length === 0 ? (
                            <p className={styles.emptyText}>No playlists yet</p>
                        ) : (
                            sidebarPlaylists.map((playlist) => (
                                <Link
                                    key={playlist._id}
                                    to={`/playlist/${playlist._id}`}
                                    className={styles.playlistItem}
                                >
                                    <span
                                        className={styles.playlistIcon}
                                        style={{ background: getPlaylistGradient(playlist.name) }}
                                    >
                                        {!playlist.isPublic && '🔒'}
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